<script lang="ts">
	import { formatDateTime, formatDate, getImageBlob } from '$lib';
	import HairlineSeparator from '$lib/ui/HairlineSeparator.svelte';
	import { CopyIcon, ImageIcon, LinkIcon, ShareIcon } from '@lucide/svelte';
	import type { PageProps } from './$types';
	import Tooltip from 'sv-tooltip';
	import { browser } from '$app/environment';
	import * as twgl from 'twgl.js';
	import { vertex, fragment } from '$lib/shaders/panorama';
	import { keyboardState } from '$lib/state.svelte';

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

	// Rendering

	/*
	Bugs:
	- all everything is completely horizontally flipped
	- the UVs have changed due to me using 'whatever the hell has been prescribed' - the bottom and top UVs are not in the correct rotation
	- speed is somewhat more difficult to modulate and thus has not been reimplemented yet
	*/

	let panoramaCanvas: HTMLCanvasElement;
	let canRender = $state(true);
	let hasRendered = $state(false);

	function initGraphics(gl: WebGLRenderingContext) {
		twgl.setDefaults({
			attribPrefix: 'a_'
		});
		const m4 = twgl.m4;
		const programInfo = twgl.createProgramInfo(gl, [vertex, fragment]);
		const plane = twgl.primitives.createXYQuadBufferInfo(gl);

		const camera = m4.identity();
		const view = m4.identity();
		const projection = m4.identity();
		const viewDirection = m4.identity();
		const viewDirectionProjection = m4.identity();
		const viewDirectionProjectionInverse = m4.identity();

		const fov = 85;

		const uniforms = {
			u_skybox: twgl.createTexture(gl, {
				target: gl.TEXTURE_CUBE_MAP,
				//src: `/img/${data.id}/raw`,
				src: `/assets/panorama_test_webgl.png`,
				flipY: 0
			}),
			u_viewDirectionProjectionInverse: viewDirectionProjectionInverse,
			u_viewDirectionProjection: viewDirectionProjection,
			u_projection: projection,
			u_view: view
		};

		let rotationModifier = $state(1);

		$effect(() => {
			const speedModifier0 = !keyboardState.currentKeys['ArrowDown'] ? 1 : 0.5;
			const speedModifier1 = !keyboardState.currentKeys[' '] ? 1 : 2;
			const speedModifier2 = !keyboardState.currentKeys['Control'] ? 1 : 2;
			const speedModifier3 = !keyboardState.currentKeys['Shift'] ? 1 : 2;
			const speedModifier4 = !keyboardState.currentKeys['ArrowUp'] ? 1 : 2;
			const directionModifier = !keyboardState.currentKeys['ArrowLeft'] ? 1 : -1;

			rotationModifier =
				1 *
				directionModifier *
				speedModifier0 *
				speedModifier1 *
				speedModifier2 *
				speedModifier3 *
				speedModifier4;
		});

		function renderPanorama(time: number) {
			time *= 0.001;
			gl.clearColor(0.0, 0.0, 0.0, 0.0);

			twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
			gl.viewport(
				0,
				0,
				(gl.canvas as HTMLCanvasElement).width,
				(gl.canvas as HTMLCanvasElement).height
			);

			const orbitSpeed = time / 20;
			const radius = 20;
			const projection = m4.perspective(
				(fov * Math.PI) / 180,
				(gl.canvas as HTMLCanvasElement).clientWidth /
					(gl.canvas as HTMLCanvasElement).clientHeight,
				0.05,
				10.0
			);
			const eye = [Math.cos(orbitSpeed) * radius, 4, Math.sin(orbitSpeed) * radius];
			const target = [0, 0, 0];
			const up = [0, 1, 0];

			m4.lookAt(eye, target, up, camera);
			m4.inverse(camera, view);
			m4.setTranslation(view, [0, 0, 0], viewDirection);
			m4.multiply(projection, viewDirection, viewDirectionProjection);
			m4.inverse(viewDirectionProjection, viewDirectionProjectionInverse);

			gl.useProgram(programInfo.program);
			twgl.setBuffersAndAttributes(gl, programInfo, plane);
			twgl.setUniforms(programInfo, uniforms);
			twgl.drawBufferInfo(gl, plane);

			requestAnimationFrame(renderPanorama);
		}

		requestAnimationFrame(renderPanorama);
		hasRendered = true;
	}

	$effect(() => {
		const drawContext = panoramaCanvas.getContext('webgl2');
		if (drawContext === null) {
			canRender = false;
			return;
		}

		initGraphics(drawContext);
	});
</script>

<svelte:head>
	<title>{data.image.filename} | Snapper</title>
	<meta name="title" content={`${data.image.filename} on Snapper`} />
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
	class="fixed font-semibold size-full text-center top-0 left-0 -z-11 flex flex-col items-center justify-center"
>
	<p>Loading panorama...</p>
	{#if !canRender}
		<p>Your browser might not like WebGL. Sorry!</p>
	{/if}
</span>

<div
	style="transition: opacity 1s; opacity: {hasRendered ? 100 : 0}%"
	class="fixed top-0 left-0 size-full -z-10"
>
	<canvas class="size-full" bind:this={panoramaCanvas}></canvas>
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
