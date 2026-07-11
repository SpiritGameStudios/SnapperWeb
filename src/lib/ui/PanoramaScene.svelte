<script lang="ts">
	import { Mesh, MeshBasicMaterial } from 'three';
	import { T, useTask } from '@threlte/core';
	import { asset } from '$app/paths';
	import { useGltf, useTexture } from '@threlte/extras';
	import { keyboardState } from '$lib/state.svelte';
	import type { PictureData } from '$lib/types';

	const {
		onRendered,
		imageId
	}: {
		onRendered: (event: MeshBasicMaterial) => void;
		imageId: string;
	} = $props();

	const id = (() => imageId)();

	const panoramaTexture = useTexture(`https://snapper.spiritstudios.dev/img/${id}/raw`);
	const panoramaModel = useGltf(asset('/assets/panorama_model.gltf'));

	if ($panoramaModel && $panoramaTexture) {
		const model = $panoramaModel.scene;
		model.traverse(function (child) {
			if (child instanceof Mesh) {
				child.material.map = $panoramaTexture;
			}
		});
	}

	let speedModifier = $state(20);

	keyboardState.listeners.push((event) => {
		console.log(keyboardState.currentKey);
		if (keyboardState.currentKey === 'ArrowUp') {
			speedModifier -= 10;
		}
		if (keyboardState.currentKey === 'ArrowDown') {
			speedModifier += 20;
		}
	});

	$inspect(keyboardState.listeners);

	let rotation = $state(45);
	useTask((delta) => {
		rotation += delta / speedModifier;
	});
</script>

<T.PerspectiveCamera
	makeDefault
	position={[0, 100, 0]}
	fov={100}
	oncreate={(ref) => {
		ref.lookAt(10, 95, 0);
	}}
></T.PerspectiveCamera>

<T.AmbientLight intensity={2} position={[0, 10, 10]} />
{#if $panoramaTexture && $panoramaModel}
	<T.MeshBasicMaterial
		oncreate={(event) => onRendered(event)}
		scale={80}
		is={$panoramaModel.scene}
		rotation.y={rotation}
		map={$panoramaTexture}
	/>
{/if}
