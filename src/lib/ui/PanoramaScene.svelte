<script lang="ts">
	import { Group, TextureLoader, MeshStandardMaterial, type Object3DEventMap } from 'three';
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
	import { T, useLoader, useTask } from '@threlte/core';
	import { asset } from '$app/paths';

	const panoramaTexture = useLoader(TextureLoader).load(asset('/assets/panorama_test.png'));
	const panoramaModel = useLoader(GLTFLoader).load(asset('/assets/panorama_model.gltf'));

	const panoramaMaterial = new MeshStandardMaterial({});

	let rotation = $state(45);
	useTask((delta) => {
		rotation += delta / 20;
	});

	const { onRendered }: { onRendered: (event: Group<Object3DEventMap>) => void } = $props();
</script>

<T.PerspectiveCamera
	makeDefault
	position={[0, 100, 0]}
	fov={100}
	oncreate={(ref) => {
		ref.lookAt(10, 95, 0);
	}}
></T.PerspectiveCamera>

<T.AmbientLight position={[0, 10, 10]} />
{#if $panoramaTexture && $panoramaModel}
	<T
		oncreate={(event) => onRendered(event)}
		scale={80}
		is={$panoramaModel.scene}
		rotation.y={rotation}
		map={$panoramaTexture}
	/>
{/if}
