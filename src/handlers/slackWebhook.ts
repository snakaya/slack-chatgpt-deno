export async function SlackWebhook (message:string, webhookUrl:string): Promise<Response> {
	try {
		const res:Response = await fetch(webhookUrl,	{
			method: "POST",
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
			body: JSON.stringify({
				text: message,
				response_type: "in_channel",
			}),
		});
		console.debug(res);
		return res;
	} catch (e) {
		console.error(`Unkown other error: [${e}]`);
		throw e;
	}
};