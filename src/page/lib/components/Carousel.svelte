<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { EmblaCarouselType } from 'embla-carousel';
	import emblaCarouselSvelte from 'embla-carousel-svelte';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	type BoundaryDirection = 'prev' | 'next';

	export let canMovePrev = false;
	export let canMoveNext = false;

	let emblaApi: EmblaCarouselType | undefined;
	let dots: boolean[] = [true];
	let canScrollPrev = false;
	let canScrollNext = false;

	const dispatch = createEventDispatcher<{
		boundary: BoundaryDirection;
	}>();

	const embla = {
		options: {
			slidesToScroll: 3,
			skipSnaps: true,
			breakpoints: {
				'(width <= 40rem)': {
					slidesToScroll: 2
				},
				'(width <= 28rem)': {
					slidesToScroll: 1
				}
			},
			watchResize: (api: EmblaCarouselType) => {
				setDots(api);
				return true;
			}
		},
		plugins: []
	};

	function updateButtonStates() {
		if (!emblaApi) {
			canScrollPrev = false;
			canScrollNext = false;
			return;
		}

		canScrollPrev = emblaApi.canScrollPrev();
		canScrollNext = emblaApi.canScrollNext();
	}

	function setDots(api: EmblaCarouselType) {
		dots = Array.from(
			{ length: api.scrollSnapList().length },
			(_, index) => index === api.selectedScrollSnap()
		);
		updateButtonStates();
	}

	function handlePrevControl() {
		if (emblaApi && emblaApi.canScrollPrev()) {
			emblaApi.scrollPrev();
			return;
		}

		if (canMovePrev) {
			dispatch('boundary', 'prev');
		}
	}

	function handleNextControl() {
		if (emblaApi && emblaApi.canScrollNext()) {
			emblaApi.scrollNext();
			return;
		}

		if (canMoveNext) {
			dispatch('boundary', 'next');
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
			return;
		}

		if (event.key === 'ArrowLeft') {
			event.preventDefault();
			handlePrevControl();
		}

		if (event.key === 'ArrowRight') {
			event.preventDefault();
			handleNextControl();
		}
	}

	function init(event: CustomEvent<EmblaCarouselType>) {
		emblaApi = event.detail;
		setDots(emblaApi);
		emblaApi.on('select', setDots);
		emblaApi.on('slidesInView', setDots);
		emblaApi.on('reInit', setDots);
	}
</script>

<svelte:window on:keydown={handleKeydown} />


<div class="relative select-none">
	{#if dots.length > 1}
		<div class="pointer-events-none absolute inset-x-0 -bottom-6 z-10 flex justify-center">
			<div class="pointer-events-auto flex items-center gap-1.5 rounded-full border border-primary/15 bg-black/15 px-2 py-1 backdrop-blur-sm">
				{#each dots as active, index}
					<button
						class={`cursor-pointer rounded-full transition-all duration-200 ${
							active
								? 'h-1.5 w-7 bg-primary shadow-[0_0_14px_rgba(161,205,68,0.45)]'
								: 'h-1.5 w-3 bg-primary/25 hover:bg-primary/45'
						}`}
						aria-label="Go to slide"
						aria-current={active}
						on:click={() => emblaApi && emblaApi.scrollTo(index)}
					></button>
				{/each}
			</div>
		</div>
	{/if}
	<div class="embla overflow-hidden" use:emblaCarouselSvelte={embla} on:emblaInit={init}>
		<div class="embla__container">
			<slot />
		</div>
		<button
			class="akg-glow absolute -left-12 top-1/2 z-10 -translate-y-1/2 cursor-pointer p-2 disabled:pointer-events-none disabled:opacity-20"
			aria-label="Previous"
			disabled={!canScrollPrev && !canMovePrev}
			on:click={handlePrevControl}
		>
			<ChevronLeft class="size-5" />
		</button>

		<button
			class="akg-glow absolute -right-12 top-1/2 z-10 -translate-y-1/2 cursor-pointer p-2 disabled:pointer-events-none disabled:opacity-20"
			aria-label="Next"
			disabled={!canScrollNext && !canMoveNext}
			on:click={handleNextControl}
		>
			<ChevronRight class="size-5" />
		</button>
	</div>
</div>