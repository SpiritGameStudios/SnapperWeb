import { getImageBlob, spiritHeaders } from '$lib';
import type { PictureData } from '$lib/types';
import { error, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	let imageData: PictureData = await fetch(`https://api.axolotlclient.com/v1/image/${params.id}`, {
		mode: 'no-cors',
		headers: spiritHeaders
	})
		.then((response) => response.json())
		.catch(() => error(404, 'Not found'));

	const imageBlob = getImageBlob(imageData.file);

	const response = new Response(imageBlob, {
		headers: {
			'Content-Type': 'image/png',
			'Content-Length': imageBlob.size.toString(),
			'Access-Control-Allow-Origin': 'localhost'
		}
	});

	return response;
};
