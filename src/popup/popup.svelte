<script lang="ts">
    import '@fontsource-variable/open-sans';
    import { onMount } from 'svelte';
    import { ExternalLink, Settings } from 'lucide-svelte';

    import Carousel from '$lib/components/Carousel.svelte';
    import GameCard from '$lib/components/GameCard.svelte';
    import { fetchAllChanges } from '$lib/api';
    import { getPlatformDetails, getPlatforms } from '$lib/data';
    import { defaultOptions, getOptions, saveOptions } from '$lib/storage';
    import type { ExtensionOptions, Game, Platform } from '$lib/types';
    import logo from '../page/lib/icons/alike.svg';
    import './popup.scss';

    type TabType = 'added' | 'left' | 'coming' | 'leaving';

    let activeTab: TabType = 'added';
    let showSettings = false;
    let loading = true;
    let options: ExtensionOptions = structuredClone(defaultOptions);
    let games: Record<TabType, Game[]> = {
        added: [],
        left: [],
        coming: [],
        leaving: []
    };

    const tabs: { id: TabType; label: string }[] = [
        { id: 'added', label: 'Recently Added' },
        { id: 'left', label: 'Recently Left' },
        { id: 'coming', label: 'Coming Soon' },
        { id: 'leaving', label: 'Leaving Soon' }
    ];

    async function loadGames() {
        loading = true;

        try {
            const storedOptions = await getOptions();
            options = storedOptions;
            games = await fetchAllChanges(storedOptions.timeFrame, storedOptions);
        } catch (error) {
            console.error('Error loading games:', error);
        } finally {
            loading = false;
        }
    }

    async function handlePlatformToggle(platform: Platform) {
        options = {
            ...options,
            enabled: {
                ...options.enabled,
                [platform]: !options.enabled[platform]
            }
        };

        await saveOptions(options);
        await loadGames();
    }

    async function handleTimeFrameChange(event: Event) {
        const target = event.currentTarget as HTMLSelectElement;
        options = {
            ...options,
            timeFrame: parseInt(target.value, 10)
        };

        await saveOptions(options);
        await loadGames();
    }

    async function handleShowNoInfoBarChange() {
        options = {
            ...options,
            showNoInfoBar: !options.showNoInfoBar
        };

        await saveOptions(options);
    }

    onMount(() => {
        void loadGames();
    });
</script>

<div class="flex h-full flex-col">
    <header class="flex items-center justify-between bg-section px-4 py-3">
        <div class="flex items-center gap-3">
            <img src={logo} alt="alike03" class="h-8 w-8 opacity-80" />
            <h1 class="text-lg font-bold">Subscription Info</h1>
        </div>
        <div class="flex items-center gap-2">
            <a
                href="https://aligueler.com/SubscriptionInfo/"
                target="_blank"
                class="rounded-md p-2 text-dim transition-colors hover:bg-hover hover:text-main"
                title="Visit website"
            >
                <ExternalLink class="h-5 w-5" />
            </a>
            <button
                class="rounded-md p-2 text-dim transition-colors hover:bg-hover hover:text-main"
                on:click={() => (showSettings = !showSettings)}
                title="Settings"
            >
                <Settings class="h-5 w-5" />
            </button>
        </div>
    </header>

    {#if showSettings}
        <div class="border-b border-hover bg-card px-4 py-4">
            <h2 class="mb-3 text-sm font-semibold text-dim">Settings</h2>

            <div class="mb-4">
                <label for="timeframe-select" class="mb-2 block text-xs text-dim">Time Frame</label>
                <select
                    id="timeframe-select"
                    class="rounded-md border border-hover bg-section px-3 py-1.5 text-sm text-main"
                    value={options.timeFrame}
                    on:change={handleTimeFrameChange}
                >
                    <option value={7}>Last 7 days</option>
                    <option value={14}>Last 14 days</option>
                    <option value={30}>Last 30 days</option>
                </select>
            </div>

            <div class="mb-4">
                <span class="mb-2 block text-xs text-dim">Enabled Platforms</span>
                <div class="flex flex-wrap gap-2">
                    {#each getPlatforms() as platform}
                        {@const details = getPlatformDetails(platform)}
                        <button
                            class={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-all ${
                                options.enabled[platform]
                                    ? `${details.bg} text-white`
                                    : 'bg-section text-dim opacity-50'
                            }`}
                            on:click={() => handlePlatformToggle(platform)}
                        >
                            <img src={details.icon} alt={details.name} class="h-3.5 w-3.5" />
                            {details.name}
                        </button>
                    {/each}
                </div>
            </div>

            <div>
                <label class="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        checked={options.showNoInfoBar}
                        on:change={handleShowNoInfoBarChange}
                        class="rounded"
                    />
                    <span class="text-dim">Show info bar for games not in any service</span>
                </label>
            </div>
        </div>
    {/if}

    <nav class="flex border-b border-hover bg-card/50">
        {#each tabs as tab}
            <button
                class={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-dim hover:bg-hover hover:text-main'
                }`}
                on:click={() => (activeTab = tab.id)}
            >
                {tab.label}
            </button>
        {/each}
    </nav>

    <main class="flex-1 overflow-y-auto p-4">
        {#if loading}
            <div class="flex h-full items-center justify-center">
                <div class="text-dim">Loading...</div>
            </div>
        {:else if games[activeTab].length === 0}
            <div class="flex h-full items-center justify-center">
                <div class="text-center text-dim">
                    <p class="mb-2">No games found</p>
                    <p class="text-xs">Try adjusting the time frame in settings</p>
                </div>
            </div>
        {:else}
            <Carousel>
                {#each games[activeTab] as game (game.id)}
                    <div class="embla__slide">
                        <GameCard {game} />
                    </div>
                {/each}
            </Carousel>
        {/if}
    </main>

    <footer class="border-t border-hover bg-section px-4 py-2 text-center text-xs text-dim">
        Made by
        <a href="https://github.com/alike03" target="_blank" class="text-primary hover:underline">
            alike03
        </a>
    </footer>
</div>
