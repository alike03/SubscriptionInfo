<script lang="ts">
    import '../app.css';
    import './popup.scss';

	import { onMount } from "svelte";
	import { Card, CardContent } from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";
    import * as Carousel from "$lib/components/ui/carousel";
    import { type CarouselAPI } from "$lib/components/ui/carousel/context";
	import { Calendar } from "lucide-svelte";

    let api: CarouselAPI;
    let count = 0;
    let current = 0;

	let games = ([
		{
			title: "Cyberpunk 2077",
			image: "https://svelte0.dev/images/placeholder.png",
			platform: "Xbox Game Pass",
			joinDate: "2023-12-01",
			leaveDate: null,
		},
		{
			title: "The Witcher 3",
			image: "https://svelte0.dev/images/placeholder.png",
			platform: "PlayStation Plus",
			joinDate: "2023-10-15",
			leaveDate: "2024-04-15",
		},
		{
			title: "Hades",
			image: "https://svelte0.dev/images/placeholder.png",
			platform: "Nintendo Switch Online",
			joinDate: "2024-01-01",
			leaveDate: null,
		},
		{
			title: "Red Dead Redemption 2",
			image: "https://svelte0.dev/images/placeholder.png",
			platform: "Xbox Game Pass",
			joinDate: "2023-11-01",
			leaveDate: "2024-05-01",
		},
	]);

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
	}

    $: if (api) {
        count = api.scrollSnapList().length;
        current = api.selectedScrollSnap() + 1;
        api.on("select", () => {
            current = api.selectedScrollSnap() + 1;
        });
    }
</script>

<div class="p-16">
    <div class="flex justify-between">
        <h1 class="text-2xl font-semibold mb-4">My Game Passes</h1>
        <div class="text-muted-foreground py-2 text-center text-sm">
            Slide {current} of {count}
        </div>
    </div>
    <Carousel.Root bind:api
        opts={{ align: "start", loop: true }}
    >
        <Carousel.Content>
            {#each games as game}
                <Carousel.Item class="sm:basis-1/2 md:basis-1/3">
                    <Card class="h-full bg-gray-800 border-gray-700">
                        <CardContent class="flex flex-col p-4">
                            <div class="aspect-[16/9] relative mb-4">
                                <img src={game.image} alt={game.title} class="rounded-lg object-cover w-full h-full" />
                            </div>
                            <h3 class="text-lg font-semibold mb-2 text-gray-100">{game.title}</h3>
                            <Badge class="w-fit mb-4 bg-gray-700 text-gray-200">{game.platform}</Badge>
                            <div class="flex flex-col space-y-2 text-xs">
                                <div class="flex items-center justify-between bg-green-900 rounded-md p-2">
                                    <div class="flex items-center">
                                        <Calendar class="w-4 h-4 mr-2 text-green-400" />
                                        <span class="font-medium text-green-400">Joined</span>
                                    </div>
                                    <span class="text-green-400">{formatDate(game.joinDate)}</span>
                                </div>
                                {#if game.leaveDate}
                                    <div class="flex items-center justify-between bg-red-900 rounded-md p-2">
                                        <div class="flex items-center">
                                            <Calendar class="w-4 h-4 mr-2 text-red-400" />
                                            <span class="font-medium text-red-400">Left</span>
                                        </div>
                                        <span class="text-red-400">{formatDate(game.leaveDate)}</span>
                                    </div>
                                {:else}
                                    <div class="flex items-center justify-between bg-blue-900 rounded-md p-2">
                                        <div class="flex items-center">
                                            <Calendar class="w-4 h-4 mr-2 text-blue-400" />
                                            <span class="font-medium text-blue-400">Active</span>
                                        </div>
                                        <span class="text-blue-400">Currently</span>
                                    </div>
                                {/if}
                            </div>
                        </CardContent>
                    </Card>
                </Carousel.Item>
            {/each}
        </Carousel.Content>
        <Carousel.Previous />
        <Carousel.Next />
    </Carousel.Root>
</div>