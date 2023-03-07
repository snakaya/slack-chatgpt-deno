export type ChatGPTMessages = {
	role: RoleType,
	content: string,
};

export type RoleType = 'system'|'user'|'assistant';