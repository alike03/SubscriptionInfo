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

const localesByLanguage = {
	en: 'en-US',
	de: 'de-DE',
	tr: 'tr-TR'
} as const;

export function formatDate(
	date: string,
	language: keyof typeof localesByLanguage = 'en',
	options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string {
	const parsedDate = parseDate(date);
	if (!parsedDate) return date;

	return new Intl.DateTimeFormat(localesByLanguage[language] ?? localesByLanguage.en, options).format(
		parsedDate
	);
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

export function waitForElement(selector: string): Promise<Element> {
	return new Promise((resolve) => {
		const element = document.querySelector(selector);

		if (element) {
			resolve(element);
			return;
		}

		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				const nodes = Array.from(mutation.addedNodes);
				for (const node of nodes) {
					if (node instanceof Element && node.matches && node.matches(selector)) {
						observer.disconnect();
						resolve(node);
						return;
					}
				}
			});
		});

		observer.observe(document.documentElement, { childList: true, subtree: true });
	});
}
