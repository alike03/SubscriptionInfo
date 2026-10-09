/**
 * Live coverage check: loads the built Chrome extension into Google Chrome, opens a set of Steam
 * store pages and compares the games the API lists on a subscription with the badges mounted.
 * Steam markup changes break the content-script hooks silently, so run this before a release.
 *
 * Usage:
 *   bun run check:pages [page ...]  builds dist/ for Chrome first; default: every page below
 *   bun run check:pages --screens   also saves one screenshot per page to _dump/check-pages/
 *   bun run check:pages --login     logs in again first, e.g. after the Steam session expired
 *
 * Wishlist and calendar need a Steam login: without a saved session, a login window opens and
 * the check starts as soon as the login completes. Outside a terminal those pages are skipped.
 *
 * Needs Google Chrome installed. Branded Chrome ignores --load-extension (Chrome 137+), so the
 * extension goes in via CDP Extensions.loadUnpacked, which needs --enable-unsafe-extension-debugging.
 * The login file holds a live Steam session: it is gitignored, never commit or share it.
 */
import { chromium, type BrowserContext, type Page } from 'playwright-core';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const EXTENSION_DIR = join(ROOT, 'dist');
const AUTH_FILE = join(ROOT, '.auth/steam.json');
const SCREENS_DIR = join(ROOT, '_dump/check-pages');
const STORE = 'https://store.steampowered.com';
const API_URL = 'https://sub.aligueler.com/api/game';
const API_BATCH_SIZE = 100;
const LOGIN_COOKIE = 'steamLoginSecure';
const LOGIN_TIMEOUT_MS = 5 * 60 * 1000;
// Holds the run's PID, so later runs can delete profiles of runs that were killed.
const PROFILE_PREFIX = `subinfo-check-${process.pid}-`;
const SETTLE_MS = 3500;
const SCROLL_STEPS = 8;
const POLL_MS = 250;
const MAX_GAMES_PER_LOCATION = 4;
const SPINNER = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';

interface CheckedPage {
	name: string;
	path: string;
	auth?: boolean;
}

const PAGES: CheckedPage[] = [
	{ name: 'home', path: '/' },
	{ name: 'search', path: '/search/?filter=topsellers' },
	{ name: 'wishlist', path: '/wishlist/', auth: true },
	{ name: 'calendar', path: '/personalcalendar', auth: true },
	// 1374490 = on Game Pass (banner), 1465470 = no subscription (no-info bar) as of 2026-10.
	{ name: 'app', path: '/app/1374490/' },
	{ name: 'app-noinfo', path: '/app/1465470/' },
	{ name: 'specials', path: '/specials' },
	{ name: 'category', path: '/category/action/' },
	{ name: 'tag', path: '/tags/en/Survival/' },
	{ name: 'genre', path: '/genre/Free%20to%20Play/' },
	{ name: 'charts', path: '/charts/topselling/global' },
	{ name: 'explore-new', path: '/explore/new/' },
	{ name: 'morelike', path: '/recommended/morelike/app/1374490/' },
	{ name: 'publisher', path: '/publisher/XboxGameStudios' },
];

interface PageSnapshot {
	appIds: number[];
	// appid -> link and two ancestors, to find the missing hook when a game has no badge.
	locations: Record<number, string>;
	badgedIds: number[];
	doubled: number;
	hasAppBanner: boolean;
}

interface PageResult {
	name: string;
	onSubscription: number;
	badged: number;
	doubled: number;
	missing: { game: string; location: string }[];
	errors: string[];
	skipped?: string;
	ok: boolean;
}

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const pageNames = args.filter((arg) => !arg.startsWith('--'));
// A terminal gets a live status line and colours, and may open the login window.
const interactive = !!process.stdout.isTTY;
const paint = (code: number) => (text: string) =>
	interactive && !process.env.NO_COLOR ? `\x1b[${code}m${text}\x1b[0m` : text;
const bold = paint(1);
const dim = paint(2);
const red = paint(31);
const green = paint(32);
const cyan = paint(36);

// Rendered by the status ticker; checkPage() updates stage and badges as the page loads.
const status = { position: '', stage: '', badges: 0, ok: 0, failed: 0, frame: 0 };
let ticker: ReturnType<typeof setInterval> | undefined;

assertChromeBuild();
const unknown = pageNames.filter((name) => !PAGES.some((page) => page.name === name));
if (unknown.length > 0) {
	console.error(`Unknown page(s): ${unknown.join(', ')}. Known: ${PAGES.map((page) => page.name).join(', ')}`);
	process.exit(1);
}
const pages = pageNames.length > 0 ? PAGES.filter((page) => pageNames.includes(page.name)) : PAGES;

if (flags.has('--login') || (interactive && pages.some((page) => page.auth) && !hasSession())) {
	await login();
}
process.exit(await checkPages(pages));

async function login() {
	const browser = await chromium.launch({ channel: 'chrome', headless: false });
	try {
		const context = await browser.newContext();
		const page = await context.newPage();
		await page.goto(`${STORE}/login/`);
		console.log('Log in to Steam in the opened window. The check starts once you are logged in (max. 5 minutes).');

		const deadline = Date.now() + LOGIN_TIMEOUT_MS;
		while (!(await context.cookies(STORE)).some((cookie) => cookie.name === LOGIN_COOKIE)) {
			if (Date.now() > deadline) throw new Error('timed out');
			await page.waitForTimeout(1000);
		}

		mkdirSync(dirname(AUTH_FILE), { recursive: true });
		await context.storageState({ path: AUTH_FILE });
		chmodSync(AUTH_FILE, 0o600);
		console.log(`Logged in. Saved the Steam session to ${relative(ROOT, AUTH_FILE)}.`);
	} catch (error) {
		// Closing the window lands here too: carry on with the public pages.
		const message = (error as Error).message;
		console.warn(`Login not completed (${message.includes('closed') ? 'window closed' : message.split('\n')[0]}).`);
	} finally {
		await browser.close().catch(() => {});
	}
}

function hasSession() {
	if (!existsSync(AUTH_FILE)) return false;
	const { cookies = [] } = JSON.parse(readFileSync(AUTH_FILE, 'utf8')) as {
		cookies?: { name: string; expires: number }[];
	};
	// expires = -1 marks a browser-session cookie.
	return cookies.some(
		(cookie) => cookie.name === LOGIN_COOKIE && (cookie.expires === -1 || cookie.expires * 1000 > Date.now()),
	);
}

async function checkPages(pages: CheckedPage[]) {
	const loggedIn = hasSession();
	if (!loggedIn && pages.some((page) => page.auth)) {
		console.warn('No Steam session: pages that need a login are skipped.');
	}
	if (flags.has('--screens')) {
		mkdirSync(SCREENS_DIR, { recursive: true });
	}

	removeOrphanedProfiles();
	// The profile holds the copied Steam cookies: remove it on every exit path.
	const profileDir = mkdtempSync(join(tmpdir(), PROFILE_PREFIX));
	const context = await launchWithExtension(profileDir);
	let cleanup: Promise<void> | undefined;
	const cleanUp = () =>
		(cleanup ??= context
			.close()
			.catch(() => {})
			// Chrome can still be flushing files into the profile right after close().
			.finally(() => rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })));
	let interrupted = false;
	for (const signal of ['SIGINT', 'SIGTERM'] as const) {
		process.once(signal, () => {
			interrupted = true;
			stopTicker();
			console.log('Interrupted, cleaning up ...');
			void cleanUp().then(() => process.exit(130));
		});
	}

	console.log(dim(`Checking ${pages.length} page(s) with the Chrome build, about 15 s each.\n`));
	const nameWidth = Math.max(4, ...pages.map((page) => page.name.length)) + 2;
	console.log(dim(`  ${'page'.padEnd(nameWidth)}${'badged'.padStart(9)}   result`));
	console.log(dim(`  ${'─'.repeat(nameWidth + 30)}`));
	const startedAt = Date.now();
	const results: PageResult[] = [];
	try {
		if (loggedIn) {
			const { cookies } = JSON.parse(readFileSync(AUTH_FILE, 'utf8'));
			await context.addCookies(cookies);
		}
		startTicker();
		const width = String(pages.length).length;
		for (const [index, page] of pages.entries()) {
			if (interrupted) break;
			Object.assign(status, { position: `${String(index + 1).padStart(width)}/${pages.length}  ${page.name}`, stage: 'loading', badges: 0 });

			const result =
				page.auth && !loggedIn ? emptyResult(page.name, 'needs a login') : await checkPage(context, page);
			if (interrupted) break;
			results.push(result);
			if (!result.skipped) status[result.ok ? 'ok' : 'failed']++;
			// Replaces the live line with the finished row; the ticker redraws below it.
			process.stdout.write(`${interactive ? '\r\x1b[2K' : ''}${formatRow(result, nameWidth)}\n`);
		}
	} finally {
		stopTicker();
		await cleanUp();
	}

	report(results, Date.now() - startedAt);
	return results.every((result) => result.ok) ? 0 : 1;
}

function removeOrphanedProfiles() {
	for (const name of readdirSync(tmpdir())) {
		const pid = Number(name.match(/^subinfo-check-(\d+)-/)?.[1]);
		if (!pid || isRunning(pid)) continue;
		rmSync(join(tmpdir(), name), { recursive: true, force: true });
	}
}

function isRunning(pid: number) {
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		// EPERM = alive but owned by another user.
		return (error as { code?: string }).code === 'EPERM';
	}
}

function assertChromeBuild() {
	const manifestPath = join(EXTENSION_DIR, 'manifest.json');
	if (!existsSync(manifestPath)) {
		throw new Error('dist/ is empty. Run bun run build:chrome first.');
	}
	// build:firefox writes to the same dist/, and Chrome rejects that manifest.
	const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
	if (!manifest.background?.service_worker) {
		throw new Error('dist/ holds the Firefox build. Run bun run build:chrome first.');
	}
}

async function launchWithExtension(profileDir: string) {
	const context = await chromium.launchPersistentContext(profileDir, {
		channel: 'chrome',
		headless: true,
		viewport: { width: 1400, height: 1000 },
		ignoreDefaultArgs: ['--disable-extensions'],
		args: ['--enable-unsafe-extension-debugging'],
		// Playwright's own handlers exit the process before checkPages() deletes the profile.
		handleSIGINT: false,
		handleSIGTERM: false,
	});

	const browser = context.browser();
	if (!browser) throw new Error('Chrome did not expose a browser session.');
	const cdp = await browser.newBrowserCDPSession();
	await cdp.send('Extensions.loadUnpacked', { path: EXTENSION_DIR });

	return context;
}

async function checkPage(context: BrowserContext, checked: CheckedPage): Promise<PageResult> {
	const page = await context.newPage();
	const errors: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error' && message.location().url.startsWith('chrome-extension://')) {
			errors.push(message.text());
		}
	});

	try {
		await page.goto(STORE + checked.path, { waitUntil: 'domcontentloaded', timeout: 45000 });
		if (checked.auth && new URL(page.url()).pathname.startsWith('/login')) {
			throw new Error('Steam session expired: run bun run check:pages --login');
		}
		await watchBadges(page, SETTLE_MS);
		status.stage = 'scrolling';
		// Center the pointer: the wishlist scrolls its own container, not the window.
		await page.mouse.move(700, 500);
		for (let step = 0; step < SCROLL_STEPS; step++) {
			await page.mouse.wheel(0, 900);
			await watchBadges(page, 500);
		}
		await watchBadges(page, SETTLE_MS);

		status.stage = 'verifying';
		const snapshot = await page.evaluate(snapshotPage);
		const games = await fetchSubscribedGames(snapshot.appIds);
		const badged = new Set(snapshot.badgedIds);
		const missing = [...games]
			.filter(([id]) => !badged.has(id))
			.map(([id, name]) => ({ game: `${id} ${name}`, location: snapshot.locations[id] ?? '' }));

		if (checked.path.startsWith('/app/') && !snapshot.hasAppBanner) {
			errors.push('No subscription banner or no-info bar on the app page.');
		}
		if (flags.has('--screens')) {
			await saveScreenshot(page, checked.name);
		}

		return {
			name: checked.name,
			onSubscription: games.size,
			badged: games.size - missing.length,
			doubled: snapshot.doubled,
			missing,
			errors,
			ok: missing.length === 0 && snapshot.doubled === 0 && errors.length === 0,
		};
	} catch (error) {
		return { ...emptyResult(checked.name), errors: [String(error)], ok: false };
	} finally {
		// Rejects when Ctrl+C already closed the context.
		await page.close().catch(() => {});
	}
}

// Runs in the page. Counts every /app/ link with a visible image as a capsule, outside the
// header, nav and the home page's left gutter.
function snapshotPage(): PageSnapshot {
	const appIds = new Set<number>();
	const locations: Record<number, string> = {};
	for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href*="/app/"]')) {
		if (link.closest('#global_header, .responsive_header, #store_nav_area, .home_page_gutter, .gutter_item, #footer')) {
			continue;
		}
		const image = link.querySelector('img')?.getBoundingClientRect();
		if (!image || image.width < 20 || image.height < 20) continue;

		const appId = Number(link.href.match(/\/app\/(\d+)/)?.[1]);
		if (!(appId > 0) || appIds.has(appId)) continue;
		appIds.add(appId);

		const path: string[] = [];
		for (let element: Element | null = link; element && path.length < 3; element = element.parentElement) {
			path.push([element.tagName.toLowerCase(), ...element.classList].join('.'));
		}
		locations[appId] = `${Math.round(image.width)}px img in ${path.join(' < ')}`;
	}

	const targets = [...document.querySelectorAll<HTMLElement>('.alike_sub')];
	const badgedIds = targets
		.filter((target) => target.querySelector('.alike_cont .sub_flag'))
		.map((target) => Number(target.dataset.subId));
	const nested = targets.filter(
		(target) => target.parentElement?.closest('.alike_sub') && target.querySelector('.alike_cont'),
	).length;
	const sharedLinks = [...document.querySelectorAll('a[href*="/app/"]')].filter(
		(link) => link.querySelectorAll('.alike_cont').length > 1,
	).length;

	return {
		appIds: [...appIds],
		locations,
		badgedIds,
		doubled: nested + sharedLinks,
		hasAppBanner: !!document.querySelector('.alike_cont.type-3'),
	};
}

async function fetchSubscribedGames(appIds: number[]) {
	const { version } = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { version: string };
	const games = new Map<number, string>();

	for (let start = 0; start < appIds.length; start += API_BATCH_SIZE) {
		const url = new URL(API_URL);
		url.searchParams.set('steamId', appIds.slice(start, start + API_BATCH_SIZE).join(','));
		const response = await fetch(url, { headers: { 'X-SubInfo-Client': version } });
		if (!response.ok) throw new Error(`API error: ${response.status}`);

		const { games: batch = [] } = (await response.json()) as {
			games?: { sid: number; name: string; subs: unknown[] }[];
		};
		for (const game of batch) {
			if (game.subs.length > 0) games.set(game.sid, game.name);
		}
	}

	return games;
}

async function saveScreenshot(page: Page, name: string) {
	await page.evaluate(() => {
		const badge = [...document.querySelectorAll('.alike_cont')].find(
			(element) => element.getBoundingClientRect().width > 0,
		);
		badge?.scrollIntoView({ block: 'center' });
	});
	await page.waitForTimeout(700);
	await page.screenshot({ path: join(SCREENS_DIR, `${name}.png`) });
}

function emptyResult(name: string, skipped?: string): PageResult {
	return { name, onSubscription: 0, badged: 0, doubled: 0, missing: [], errors: [], skipped, ok: true };
}

// Waits like page.waitForTimeout(), but keeps the live badge count current.
async function watchBadges(page: Page, ms: number) {
	const end = Date.now() + ms;
	while (Date.now() < end) {
		await page.waitForTimeout(Math.min(POLL_MS, end - Date.now()));
		if (interactive) {
			status.badges = await page.evaluate(countBadgedGames).catch(() => status.badges);
		}
	}
}

// Runs in the page.
function countBadgedGames() {
	const ids = [...document.querySelectorAll<HTMLElement>('.alike_sub')]
		.filter((target) => target.querySelector('.alike_cont .sub_flag'))
		.map((target) => target.dataset.subId);
	return new Set(ids).size;
}

function startTicker() {
	if (!interactive) return;
	process.stdout.write('\x1b[?25l');
	ticker = setInterval(renderStatus, 100);
}

function stopTicker() {
	if (!ticker) return;
	clearInterval(ticker);
	ticker = undefined;
	process.stdout.write('\r\x1b[2K\x1b[?25h');
}

function renderStatus() {
	status.frame = (status.frame + 1) % SPINNER.length;
	const line = [
		`${cyan(SPINNER[status.frame])} ${bold(status.position.padEnd(18))}`,
		dim(status.stage.padEnd(10)),
		`${String(status.badges).padStart(3)} ${status.badges === 1 ? 'badge ' : 'badges'}`,
		dim('│'),
		`${green(`${status.ok} ok`)}  ${status.failed ? red(`${status.failed} failed`) : dim('0 failed')}`,
	];
	process.stdout.write(`\r\x1b[2K${line.join('  ')}`);
}

function formatRow(result: PageResult, nameWidth: number) {
	const name = result.name.padEnd(nameWidth);
	if (result.skipped) {
		return dim(`  ${name}${'–'.padStart(9)}   – skipped, ${result.skipped}`);
	}
	const badged = `${result.badged} / ${result.onSubscription}`.padStart(9);
	const problems = [
		result.missing.length && `${result.missing.length} missing`,
		result.doubled && `${result.doubled} doubled`,
		result.errors.length && 'error',
	].filter(Boolean);
	const verdict = result.ok ? green('✓ ok') : red(`✗ ${problems.join(', ')}`);
	return `  ${name}${badged}   ${verdict}`;
}

function report(results: PageResult[], durationMs: number) {
	const skipped = results.filter((result) => result.skipped).length;
	const failed = results.filter((result) => !result.ok).length;
	const seconds = Math.round(durationMs / 1000);
	const duration = seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
	console.log(
		`\n  ${green(`✓ ${results.length - failed - skipped} ok`)}   ${failed ? red(`✗ ${failed} failed`) : dim('✗ 0 failed')}` +
			`   ${dim(`– ${skipped} skipped   ${duration}`)}`,
	);

	for (const result of results.filter((entry) => !entry.ok)) {
		console.log(`\n  ${red('✗')} ${bold(result.name)}`);
		// Games without a badge in the same spot share one missing hook: list them per location.
		const byLocation = Map.groupBy(result.missing, (entry) => entry.location);
		for (const [location, entries] of byLocation) {
			const games = entries.slice(0, MAX_GAMES_PER_LOCATION).map((entry) => entry.game);
			const more = entries.length - games.length;
			console.log(`    ${entries.length} without badge  ${dim(location)}`);
			console.log(`      ${games.join(', ')}${more > 0 ? dim(`, +${more} more`) : ''}`);
		}
		if (result.doubled > 0) console.log(`    ${result.doubled} double badge(s)`);
		for (const error of result.errors) console.log(`    ${red('error')}     ${error.split('\n')[0]}`);
	}
	if (flags.has('--screens')) {
		console.log(dim(`\n  Screenshots: ${relative(ROOT, SCREENS_DIR)}/`));
	}
}
