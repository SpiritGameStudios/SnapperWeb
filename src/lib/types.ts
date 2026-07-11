export type PictureData = {
	uploader: string;
	filename: string;
	file: string;
	shared_at: string;
};

export type UserData = {
	uuid: string;
	username: string;
	username_history: UsernameHistoryEntry[];
	textures: {
		custom: boolean;
		slim: boolean;
		skin?: {
			url: string;
			data: string;
		};
		cape?: {
			url: string;
			data: string;
		};
		raw: {
			value: string;
			signature: string;
		};
	};
	created_at: string;
};

export type UsernameHistoryEntry = {
	username: string;
};

export type AxolotlUserData = {
	uuid: string;
	username: string;
	registered: string;
	status: {
		type: 'online' | 'offline';
		last_online: string;
	};
};

// Keyboard handling

export type KeyboardStateType = {
	currentKeys: { [key: string]: boolean };
	listeners: ((event: KeyboardEvent) => void)[];
};
