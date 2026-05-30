<script lang="ts">
    import { onMount } from "svelte";
    import { getTranslations } from "$lib/i18n";

    import Games from "./components/Games.svelte";
    import Header from "./components/Header.svelte";
    import Options from "./components/Options.svelte";
    import Tabs from "./components/Tabs.svelte";
    import { fetchAllChanges } from "$lib/api";
    import { defaultOptions, getOptions, saveOptions } from "$lib/storage";
	import type { ExtensionOptions, Game, Language, Platform, TabDefinition, TabType } from "$lib/types";

    let activeTab: TabType = "added";
    let showSettings = false;
    let loading = true;
    let options: ExtensionOptions = structuredClone(defaultOptions);
    let games: Record<TabType, Game[]> = {
        added: [],
        left: [],
        coming: [],
        leaving: [],
    };
    let translations = getTranslations(defaultOptions.language);
    let tabs: TabDefinition[] = [];

    $: translations = getTranslations(options.language);
    $: tabs = [
        { id: "added", label: translations.tabs.added },
        { id: "left", label: translations.tabs.left },
        { id: "coming", label: translations.tabs.coming },
        { id: "leaving", label: translations.tabs.leaving },
    ];

    $: if (typeof document !== 'undefined') {
        document.documentElement.lang = options.language;
    }

    async function loadGames() {
        loading = true;

        try {
            const storedOptions = await getOptions();
            options = storedOptions;
            games = await fetchAllChanges(
                storedOptions.timeFrame,
                storedOptions,
            );
        } catch (error) {
            console.error("Error loading games:", error);
        } finally {
            loading = false;
        }
    }

    async function handlePlatformToggle(platform: Platform) {
        options = {
            ...options,
            enabled: {
                ...options.enabled,
                [platform]: !options.enabled[platform],
            },
        };

        await saveOptions(options);
        await loadGames();
    }

    async function handleTimeFrameChange(timeFrame: number) {
        options = {
            ...options,
            timeFrame,
        };

        await saveOptions(options);
        await loadGames();
    }

    async function handleShowNoInfoBarChange() {
        options = {
            ...options,
            showNoInfoBar: !options.showNoInfoBar,
        };

        await saveOptions(options);
    }

    async function handleLanguageChange(language: Language) {
        options = {
            ...options,
            language,
        };

        await saveOptions(options);
    }

    onMount(() => {
        void loadGames();
    });
</script>

<div class="flex h-full flex-col">
    <Header {showSettings} translations={translations.header} on:togglesettings={() => (showSettings = !showSettings)} />

    {#if showSettings}
        <div class="flex-1 overflow-y-auto bg-card">
            <Options
                {options}
                {translations}
                on:platformtoggle={(event) => void handlePlatformToggle(event.detail)}
                on:timeframechange={(event) => void handleTimeFrameChange(event.detail)}
                on:togglenoinfobar={() => void handleShowNoInfoBarChange()}
                on:languagechange={(event) => void handleLanguageChange(event.detail)}
            />
        </div>
    {:else}
        <Tabs {activeTab} {tabs} on:select={(event) => (activeTab = event.detail)} />

        <Games {activeTab} {loading} {games} translations={translations.games} />
    {/if}
</div>
