export type VerifySubscriptionJSON = {
	[ key in VerifySubscriptionJSONAtributes]: string;
}

type VerifySubscriptionJSONAtributes = 'token' | 'challenge' | 'type';