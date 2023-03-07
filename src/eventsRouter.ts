import { EnvVars } from "./types/EnvVars.d.ts";
import { verifySubscriptionURL } from "./handlers/verifySubscriptionURL.ts";
import { GetChatGPTAnswer } from "./handlers/getChatGPTAnswer.ts";
import { EventAnswer, RoutingType } from "./types/eventAnswer.d.ts";
import { SlackWebhook } from "./handlers/slackWebhook.ts";
import { SlackConversationsReplies } from "./handlers/slackConversationsReplies.ts";
import { SlackPostMessage } from "./handlers/slackPostMessage.ts";
import { ChatGPTMessages } from "./types/chatGPTMessages.d.ts";

export const slackConversationsReplies = { SlackConversationsReplies };
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
				const threadTs = bodyJson?.event?.thread_ts || bodyJson?.event?.ts || "";
				const channelId = bodyJson?.event?.channel || "";
				const botUser = bodyJson?.authorizations[0]?.user_id || "";
				const question = bodyJson.event.text.replace(/<@\w+>/g, "").trim();
				(async () => {
					const repliesAnswer = await slackConversationsReplies.SlackConversationsReplies(threadTs, channelId, env.SLACK_BOT_TOKEN);
					console.debug(repliesAnswer);
					const chatGPTMessages: ChatGPTMessages[] = generateGPTMessages(question, JSON.stringify(JSON.parse(repliesAnswer.message).messages), botUser);
					console.debug(chatGPTMessages);
					const chatGPTAnswer = await getChatGPTAnswer.GetChatGPTAnswer(chatGPTMessages, env.OPENAI_API_KEY);
					await slackPostMessage.SlackPostMessage(JSON.parse(chatGPTAnswer.message).text, threadTs, env.SLACK_CHANNELL_NAME, env.SLACK_BOT_TOKEN);
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
					const chatGPTMessages: ChatGPTMessages[] = generateGPTMessages(question, '[]', '');
					console.debug(chatGPTMessages);
					const chatGPTAnswer = await getChatGPTAnswer.GetChatGPTAnswer(chatGPTMessages, env.OPENAI_API_KEY);
					console.debug(chatGPTAnswer);
					const res = await slackWebhook.SlackWebhook((JSON.parse(chatGPTAnswer.message)).text, responseUrl);
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

function generateGPTMessages(question: string, repliesMessages: string , botUser: string): ChatGPTMessages[] {
	const chatGPTMessages: ChatGPTMessages[] = [];
	const replies = JSON.parse(repliesMessages);

	for(const entry of replies) {
		if(entry.user == botUser) {
			chatGPTMessages.push({"role": "assistant", "content": entry.text.replace(/<@\w+>/g, "").trim()},);
		} else {
			chatGPTMessages.push({"role": "user", "content": entry.text.replace(/<@\w+>/g, "").trim()},);
		}
	}
	if(replies.length == 0 || replies[replies.length - 1].text.replace(/<@\w+>/g, "").trim() != question.replace(/<@\w+>/g, "").trim() ) {
		chatGPTMessages.push({"role": "user", "content": question.replace(/<@\w+>/g, "").trim()},);
	}

	return chatGPTMessages;
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