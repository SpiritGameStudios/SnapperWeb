import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import type { AxolotlUserData, PictureData, UserData } from '$lib/types';
import { spiritHeaders } from '$lib';

export const load: PageServerLoad = async ({ fetch, params }) => {
	let imageData = await fetch(`https://api.axolotlclient.com/v1/image/${params.id}`, {
		mode: 'no-cors',
		headers: spiritHeaders
	})
		.then((response) => response.json())
		.catch(() => error(404, 'Not Found'));

	let userData = await fetch(`https://api.axolotlclient.com/v1/user/${imageData.uploader}`, {
		mode: 'no-cors',
		headers: spiritHeaders
	})
		.then((response) => response.json())
		.catch(() => error(404, 'Failed to recieve creator data, please contact support.'));

	return {
		image: imageData as PictureData,
		creator: userData as AxolotlUserData,
		id: params.id
	};
};
