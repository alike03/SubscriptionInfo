export function debounce<T extends (...args: unknown[]) => unknown>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout>;

	return function executedFunction(...args: Parameters<T>) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};

		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
}

export function throttle<T extends (...args: unknown[]) => unknown>(
	cb: T,
	delay = 1000
): (...args: Parameters<T>) => void {
	let shouldWait = false;
	let waitingArgs: Parameters<T> | null = null;

	const timeoutFunc = () => {
		if (waitingArgs == null) {
			shouldWait = false;
		} else {
			cb(...waitingArgs);
			waitingArgs = null;
			setTimeout(timeoutFunc, delay);
		}
	};

	return (...args: Parameters<T>) => {
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
	options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string {
	return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
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