<script lang="ts">
	import { formatDateTime, formatDate, getImageBlob } from '$lib';
	import HairlineSeparator from '$lib/ui/HairlineSeparator.svelte';
	import { CopyIcon, ImageIcon, LinkIcon, ShareIcon } from '@lucide/svelte';
	import type { PageProps } from './$types';
	import Tooltip from 'sv-tooltip';
	import { browser } from '$app/environment';
	import { Canvas } from '@threlte/core';
	import PanoramaScene from '$lib/ui/PanoramaScene.svelte';

	function copyImage() {
		if (browser) {
			try {
				navigator.clipboard.write([
					new ClipboardItem({
						'image/png': getImageBlob(data.image.file)
					})
				]);
			} catch (error) {
				console.error('Failed to copy image to clipboard');
			}
		}
	}

	function canShare() {
		if (browser) {
			if (!!navigator.canShare) {
				return true;
			}
		}
		return false;
	}

	async function shareImage() {
		if (browser) {
			try {
				if (!canShare()) throw new Error();
				await navigator.share({
					url: `https://snapper.spiritstudios.dev/img/${data.id}`,
					title: `${data.image.filename} on Snapper Web`,
					text: `Panorama shared at ${formatDateTime(new Date(data.image.shared_at))} via Snapper`,
					files: [
						new File([getImageBlob(data.image.file)], data.image.filename, {
							type: 'image/png'
						})
					]
				});
			} catch {
				console.log('Share functionality unavailable in your browser or operating system.');
			}
		}
	}

	let { data }: PageProps = $props();

	let canvasVisibility = $state(0);
	function onRendered() {
		canvasVisibility = 100;
	}
</script>

<svelte:head>
	<title>{data.image.filename} | Snapper</title>
	<meta name="title" content={`${data.image.filename} on Snapper Web`} />
	<meta
		name="description"
		content={`Panorama shared at ${formatDate(new Date(data.image.shared_at))} via Snapper`}
	/>
	<meta name="publish_date" property="og:publish_date" content={data.image.shared_at} />
	<meta name="author" content={data.creator.username} />
	<meta property="og:image" content={`/img/${data.id}/raw`} />
	<meta property="twitter:card" content="summary_large_image" />
</svelte:head>

<span
	class="fixed font-semibold w-full text-center top-0 left-0 -z-11 h-full flex flex-col items-center justify-center"
	>Loading panorama...</span
>

<div
	style="transition: opacity 1s; opacity: {canvasVisibility}%"
	class="fixed top-0 left-0 w-full h-full -z-10"
>
	<Canvas>
		<PanoramaScene imageId={data.id} {onRendered} />
	</Canvas>
</div>

<div class="flex h-full justify-end flex-col items-center">
	<div
		class="flex bg-brand-background-secondary/50 backdrop-blur-3xl shadow-xl rounded-2xl border flex-col px-5 py-4 items-center gap-4"
	>
		<div class="flex flex-col items-center">
			<span class="text-xl mb-2 font-bold">{data.image.filename}</span>
			{#if data.creator.uuid}
				<span class="flex flex-col flex-wrap items-center gap-1 text-sm sm:flex-row sm:gap-4">
					<span class="flex flex-row flex-wrap items-center gap-1">
						by
						<a
							draggable="false"
							class="pixelated flex flex-row flex-wrap items-center gap-2"
							target="_blank"
							aria-label={`${data.creator.username} on NameMC`}
							href={`https://namemc.com/profile/${data.creator.username}`}
						>
							<span>
								{data.creator.username}
							</span>

							<img
								class="h-4 w-4"
								draggable="false"
								alt={`Minecraft skin head texture of creator of screenshot, ${data.creator.username}`}
								src={`https://vzge.me/face/512/${data.creator.username}.png`}
							/>
						</a>
					</span>
					<span class="hidden sm:flex">
						<HairlineSeparator />
					</span>
					<span>Shared {formatDateTime(new Date(data.image.shared_at))}</span>
				</span>
			{/if}
		</div>

		<div class="grid grid-cols-4 items-center gap-2">
			<Tooltip class="tooltip-spirit" tip="Copy image">
				<button aria-label="Copy panorama" onclick={copyImage}>
					<CopyIcon />
				</button>
			</Tooltip>
			<Tooltip class="tooltip-spirit" tip="Copy URL">
				<button aria-label="Copy URL">
					<LinkIcon
						onclick={() => {
							if (browser) {
								navigator.clipboard.writeText(`https://snapper.spiritstudios.dev/img/${data.id}`);
							}
						}}
					/>
				</button>
			</Tooltip>
			{#if browser}
				<Tooltip
					class="tooltip-spirit"
					tip={`${canShare() ? 'Share panorama' : 'Browser does not support sharing'}`}
				>
					{#if canShare()}
						<button aria-label="Browser does not support sharing">
							<ShareIcon onclick={shareImage} />
						</button>
					{:else}
						<button aria-label="Share panorama">
							<ShareIcon class="text-brand-disabled" onclick={shareImage} />
						</button>
					{/if}
				</Tooltip>
			{/if}
			<Tooltip class="tooltip-spirit" tip="View raw image">
				<button aria-label="View raw image">
					<a target="_blank" href="/img/{data.id}/raw">
						<ImageIcon />
					</a>
				</button>
			</Tooltip>
		</div>
	</div>
</div>
