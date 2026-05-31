import browser from 'webextension-polyfill';

interface LocalCacheEntry<T> {
	updatedAt: number;
	cacheKey?: string;
	value: T;
}

interface LocalCacheOptions<T> {
	storageKey: string;
	ttlMs: number;
	loader: () => Promise<T>;
	cacheKey?: string;
}

export async function getOrSetLocalCache<T>({
	storageKey,
	ttlMs,
	loader,
	cacheKey
}: LocalCacheOptions<T>): Promise<T> {
	try {
		const result = await browser.storage.local.get(storageKey);
		const cacheEntry = result?.[storageKey] as LocalCacheEntry<T> | undefined;

		if (cacheEntry) {
			const isFresh = Date.now() - cacheEntry.updatedAt <= ttlMs;
			const matchesKey = cacheKey === undefined || cacheEntry.cacheKey === cacheKey;

			if (isFresh && matchesKey) {
				return cacheEntry.value;
			}
		}
	} catch (error) {
		console.error(`Error loading local cache for ${storageKey}:`, error);
	}

	const value = await loader();

	try {
		await browser.storage.local.set({
			[storageKey]: {
				updatedAt: Date.now(),
				cacheKey,
				value
			} satisfies LocalCacheEntry<T>
		});
	} catch (error) {
		console.error(`Error saving local cache for ${storageKey}:`, error);
	}

	return value;
}