export type EventAnswer = {
	statusCode: number,
	contentType: string ,
	message: string ,
	routingType?: RoutingType,
};

export type RoutingType = 'slashCommand'|'urlVerification'|'appMention'|'none';