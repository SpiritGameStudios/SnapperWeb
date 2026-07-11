<script lang="ts">
	import { Group, Mesh, MeshBasicMaterial, type Object3DEventMap } from 'three';
	import { T, useTask } from '@threlte/core';
	import { asset } from '$app/paths';
	import { useGltf, useTexture } from '@threlte/extras';
	import { keyboardState } from '$lib/state.svelte';

	const {
		onRendered,
		imageId
	}: {
		onRendered: (event: MeshBasicMaterial) => void;
		imageId: string;
	} = $props();

	const id = (() => imageId)();

	const panoramaTexture = useTexture(`/img/${id}/raw`, {
		transform: (texture) => {
			texture.flipY = false;
			return texture;
		}
	});
	const panoramaModel = useGltf(asset('/assets/panorama_model.gltf'));

	panoramaTexture.then((texture) => {
		if ($panoramaModel && texture) {
			const model = $panoramaModel.scene;
			model.traverse(function (child) {
				if (child instanceof Mesh) {
					child.material.map = texture;
				}
			});

			// Downloads the loaded texture for testing purposes
			/*if (browser) {
				// Source - https://stackoverflow.com/a/22172860
				// Posted by ˈvɔlə, modified by community. See post 'Timeline' for change history
				// Retrieved 2026-07-11, License - CC BY-SA 4.0

				function getBase64Image(img: HTMLImageElement) {
					var canvas = document.createElement('canvas');
					canvas.width = img.width;
					canvas.height = img.height;
					var ctx = canvas.getContext('2d');
					ctx?.drawImage(img, 0, 0);
					var dataURL = canvas.toDataURL('image/png');
					return dataURL;
				}

				var base64 = getBase64Image(texture.image);
				// window.location.href = 'data:application/octet-stream;base64,' + img;
				const a = document.createElement('a');
				a.href = base64;
				a.download = 'image.png';
				a.click();
			} */
		}
	});

	let rotationModifier = $state(20);

	$effect(() => {
		const speedModifier0 = !keyboardState.currentKeys['ArrowDown'] ? 1 : 2;
		const speedModifier1 = !keyboardState.currentKeys[' '] ? 2 : 0.5;
		const speedModifier2 = !keyboardState.currentKeys['Control'] ? 1 : 0.25;
		const speedModifier3 = !keyboardState.currentKeys['Shift'] ? 1 : 0.5;
		const speedModifier4 = !keyboardState.currentKeys['ArrowUp'] ? 1 : 0.5;
		const directionModifier = !keyboardState.currentKeys['ArrowLeft'] ? 1 : -1;
		const baseModifier = 13;

		rotationModifier =
			baseModifier *
			directionModifier *
			speedModifier0 *
			speedModifier1 *
			speedModifier2 *
			speedModifier3 *
			speedModifier4;
	});

	let rotation = $state(45);
	useTask((delta) => {
		rotation += delta / rotationModifier;
	});
</script>

<T.PerspectiveCamera
	makeDefault
	position={[0, 100, 0]}
	fov={90}
	oncreate={(ref) => {
		ref.lookAt(20, 97, 0);
	}}
></T.PerspectiveCamera>

<T.AmbientLight intensity={1} position={[0, 100, 0]} />
{#if $panoramaTexture && $panoramaModel}
	<T.MeshBasicMaterial
		oncreate={(event) => onRendered(event)}
		scale={80}
		is={$panoramaModel.scene}
		rotation.y={rotation}
	/>
{/if}
