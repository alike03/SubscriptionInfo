import type { Language, SubscriptionInfo } from '$lib/types';

export function debounce<TArgs extends unknown[], TResult>(
	func: (...args: TArgs) => TResult,
	wait: number
): (...args: TArgs) => void {
	let timeout: ReturnType<typeof setTimeout>;

	return function executedFunction(...args: TArgs) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};

		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

export function throttle<TArgs extends unknown[], TResult>(
	cb: (...args: TArgs) => TResult,
	delay = 1000
): (...args: TArgs) => void {
	let shouldWait = false;
	let waitingArgs: TArgs | null = null;

	const timeoutFunc = () => {
		if (waitingArgs == null) {
			shouldWait = false;
		} else {
			cb(...waitingArgs);
			waitingArgs = null;
			setTimeout(timeoutFunc, delay);
		}
	};

	return (...args: TArgs) => {
		if (shouldWait) {
			waitingArgs = args;
			return;
		}

		cb(...args);
		shouldWait = true;

		setTimeout(timeoutFunc, delay);
	};
}

export function formatDate(
	date: string,
	language: Language = 'en-US',
	options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string {
	const parsedDate = parseDate(date);
	if (!parsedDate) return date;

	return new Intl.DateTimeFormat(language, options).format(parsedDate);
}

function parseDate(date: string): Date | null {
	const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	if (match) {
		const [, year, month, day] = match;
		return new Date(Number(year), Number(month) - 1, Number(day));
	}

	const parsedDate = new Date(date);
	return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function subHasLeft(sub: SubscriptionInfo): boolean {
	return !!sub.leave && !(new Date(sub.leave).getTime() > Date.now());
}

export function waitForElement(selector: string): Promise<Element> {
	return new Promise((resolve) => {
		const element = document.querySelector(selector);

		if (element) {
			resolve(element);
			return;
		}

		// Query the document, not the added nodes: React inserts whole subtrees,
		// so the match is usually a descendant of the added node.
		const observer = new MutationObserver(() => {
			const match = document.querySelector(selector);
			if (match) {
				observer.disconnect();
				resolve(match);
			}
		});

		observer.observe(document.documentElement, { childList: true, subtree: true });
	});
}
