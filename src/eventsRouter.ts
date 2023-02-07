import { EnvVars } from "./types/EnvVars.d.ts";
import { verifySubscriptionURL } from "./handlers/verifySubscriptionURL.ts";
import { GetChatGPTAnswer } from "./handlers/getChatGPTAnswer.ts";
import { EventAnswer, RoutingType } from "./types/eventAnswer.d.ts";
import { SlackWebhook } from "./handlers/slackWebhook.ts";
import { SlackPostMessage } from "./handlers/slackPostMessage.ts";

export const getChatGPTAnswer = { GetChatGPTAnswer };
export const slackPostMessage = { SlackPostMessage };
export const slackWebhook = { SlackWebhook };
export function EventsRouter(requestBody: string, requestMethod: string, requestURL: string, requestContentType: string, env: EnvVars): EventAnswer {
  let answer: EventAnswer = {
    statusCode: 404,
    contentType: "text/plain",
    message: `Not found routing: [${requestMethod}] [${requestURL}]`,
    routingType: "none",
  };
	try {
		const routingType = handleRoutingType(requestBody, requestMethod, requestURL, requestContentType, env.SLACK_SLASHCOMMAND, env.SLACK_SLASHCOMMAND_REQUEST_PATH);
		console.debug(requestBody);
		console.debug(requestMethod);
		console.debug(requestURL);
		console.debug(requestContentType);
		console.debug(routingType);

		switch (routingType) {
			case "urlVerification": {
				// set URLVerification answer
				answer = verifySubscriptionURL(requestBody, env.SLACK_SIGNING_SECRET);
				answer.routingType = "urlVerification";
				break;
			}
			case "appMention": {
				// set ACK
				answer.statusCode = 200;
				answer.contentType = "";
				answer.message = "";
				answer.routingType = "appMention";

				// deno-lint-ignore no-explicit-any
				const bodyJson: any = JSON.parse(requestBody);
				const threadTs = bodyJson?.event?.ts || "";
				const question = bodyJson.event.text.replace(/<@\w+>/g, "").trim();
				(async () => {
					const gptAnswer = await getChatGPTAnswer.GetChatGPTAnswer(question, env.OPENAI_API_KEY);
					await slackPostMessage.SlackPostMessage(JSON.parse(gptAnswer.message).text, threadTs, env.SLACK_BOT_TOKEN, env.SLACK_CHANNELL_NAME);
				})(); // async
				break;
			}
			case "slashCommand": {
				// set ACK
				answer.statusCode = 200;
				answer.contentType = "application/json; charset=utf-8";
				answer.message = '{text: "", response_type: "in_channel"}';
				answer.routingType = "slashCommand";

				const qs:Map<string, string> = parseQueryString(requestBody);
				const question = qs.get('text') || '';
				const responseUrl = qs.get('response_url') || '';
				(async () => {
					const gptAnswer = await getChatGPTAnswer.GetChatGPTAnswer(question, env.OPENAI_API_KEY);
					console.debug(gptAnswer);
					const res = await slackWebhook.SlackWebhook((JSON.parse(gptAnswer.message)).text, responseUrl);
					console.debug(res);
				})(); // async
				break;
			}
		}
	} catch(e) {
			answer.statusCode = 500;
			answer.message = `Other error happaned: [${e}]`;
	}
  console.debug(answer);
  return answer;
};

function handleRoutingType(requestBody: string, requestMethod: string, requestURL: string, requestContentType: string, slashCommand: string, slashcommand_path: string): RoutingType {
  console.debug(requestBody);
  let routingType: RoutingType = "none";
	try{
		const pathtext = (new URL(requestURL)).pathname;
		if (requestMethod == "POST") {
			if (requestContentType?.toLowerCase() == "application/json" && pathtext == "/slack/events") {
				const bodyJson: any = JSON.parse(requestBody);
				if (bodyJson?.type == "url_verification") {
					routingType = "urlVerification";
				} else if (bodyJson?.type == "event_callback") {
					routingType = "appMention";
				}
			} else if (requestContentType?.toLowerCase() == "application/x-www-form-urlencoded") {
				const command = parseQueryString(requestBody).get('command');
				if(pathtext == `${slashcommand_path}` && command == `${slashCommand}`) {
					routingType = "slashCommand";
				}
			}
		}
	} catch(e) {
		throw e;
	}
  return routingType;
}

function parseQueryString(requestBody: string): Map<string, string> {
	const qsMap = new Map<string, string>();

	const params = requestBody.split("&");
	for (const entry of params.entries()) {
		const t = entry[1].split("=");
    qsMap.set(t[0], decodeURIComponent(t[1]));
	}
	console.debug(qsMap);
	return qsMap;
}