export type VerifySubscriptionJSON = {
	[ key in VerifySubscriptionJSONAtributes]: string;
} & Map<string, string>

type VerifySubscriptionJSONAtributes = 'token' | 'challenge' | 'type';