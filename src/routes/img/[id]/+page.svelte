<script lang="ts">
	import { formatDateTime, formatDate, getImageBlob } from '$lib';
	import HairlineSeparator from '$lib/ui/HairlineSeparator.svelte';
	import { CopyIcon, LinkIcon, ShareIcon } from '@lucide/svelte';
	import type { PageProps } from './$types';
	import Tooltip from 'sv-tooltip';
	import { browser } from '$app/environment';

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
					text: `Image shared at ${formatDateTime(new Date(data.image.shared_at))} via Snapper`,
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
</script>

<svelte:head>
	<title>{data.image.filename} | Snapper Web</title>
	<meta name="title" content={`${data.image.filename} on Snapper`} />
	<meta
		name="description"
		content={`Image shared at ${formatDate(new Date(data.image.shared_at))} via Snapper`}
	/>
	<meta name="publish_date" property="og:publish_date" content={data.image.shared_at} />
	<meta name="author" content={data.creator.username} />
	<meta property="og:image" content={`/img/${data.id}/raw`} />
	<meta property="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="flex w-full flex-col items-center gap-4">
	<div class="flex flex-col items-center gap-2">
		<span class="text-xl font-bold">{data.image.filename}</span>
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
	<a
		draggable="false"
		aria-label="Raw screenshot"
		class="rounded-xl"
		target="_blank"
		href={`/img/${data.id}/raw`}
	>
		<img
			class="pixelated rounded-xl border shadow-2xl"
			draggable="false"
			alt={`Image created by ${data.image.uploader}`}
			src={`data:image;base64,${data.image.file}`}
		/>
	</a>
	<div class="grid grid-cols-3 items-center gap-2">
		<Tooltip class="tooltip-spirit" tip="Copy image">
			<button aria-label="Copy screenshot" onclick={copyImage}>
				<CopyIcon />
			</button>
		</Tooltip>
		<Tooltip class="tooltip-spirit" tip="Copy URL">
			<button aria-label="Copy link">
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
				tip={`${canShare() ? 'Share image' : 'Browser does not support sharing'}`}
			>
				{#if canShare()}
					<button aria-label="Browser does not support sharing">
						<ShareIcon onclick={shareImage} />
					</button>
				{:else}
					<button aria-label="Share screenshot">
						<ShareIcon class="text-brand-disabled" onclick={shareImage} />
					</button>
				{/if}
			</Tooltip>
		{/if}
	</div>
</div>
