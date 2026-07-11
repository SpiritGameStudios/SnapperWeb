import { keyboardState } from './state.svelte';

export const spiritHeaders = {
	'User-Agent': 'spiritgamestudios/snapperweb by Spirit Studios, hello@worldwidepixel.ca',
	'Content-Type': 'application/json'
};

export const formatDateTime = (time: Date) => {
	const TIME_FORMAT = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeStyle: 'short' });
	return TIME_FORMAT.format(time);
};

export const formatDate = (time: Date) => {
	const TIME_FORMAT = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' });
	return TIME_FORMAT.format(time);
};

export function getImageBlob(data: string) {
	const imageByteString = atob(data);
	const imageArrayBuffer = new ArrayBuffer(imageByteString.length);
	const imageIntArray = new Uint8Array(imageArrayBuffer);
	for (let i = 0; i < imageByteString.length; i++) {
		imageIntArray[i] = imageByteString.charCodeAt(i);
	}
	const imageBlob = new Blob([imageIntArray], { type: 'image/png' });

	return imageBlob;
}

export function handleKeys(event: KeyboardEvent, keyDown: boolean) {
	if (!keyDown) {
		keyboardState.currentKey = '';
		return;
	}
	keyboardState.currentKey = event.key;
	keyboardState.listeners.forEach((listener) => {
		listener(event);
	});
}
