import { EnvVars } from "./types/EnvVars.d.ts";
import verifySubscriptionURL from "./handlers/verifySubscriptionURL.ts";
import getChatGPTAnswer from "./handlers/getChatGPTAnswer.ts";
import { EventAnswer, RoutingType } from "./types/eventAnswer.d.ts";
import slackPostMessage from "./handlers/slackPostMessage.ts";

export default (requestBody: string, requestMethod: string, requestURL: string, requestContentType: string, env: EnvVars): EventAnswer => {
  let eventAnswer: EventAnswer = {
    statusCode: 404,
    contentType: "text/plain",
    message: `Not found routing: [${requestMethod}] [${requestURL}]`,
    routingType: "none",
  };
  const routingType = handleRoutingType(requestBody, requestMethod, requestURL, requestContentType, env.SLACK_SLASHCOMMAND, env.SLACK_SLASHCOMMAND_REQUEST_PATH);
  console.debug(requestBody);
  console.debug(requestMethod);
  console.debug(requestURL);
  console.debug(requestContentType);
  console.debug(routingType);

  switch (routingType) {
    case "urlVerification": {
      eventAnswer = verifySubscriptionURL(requestBody, env.SLACK_SIGNING_SECRET);
      eventAnswer.routingType = "urlVerification";
      break;
    }
    case "appMention": {
      eventAnswer.statusCode = 200;
      eventAnswer.routingType = "appMention";
      // deno-lint-ignore no-explicit-any
      const bodyJson: any = JSON.parse(requestBody);
      const threadTs = bodyJson?.event?.ts || "";
      const question = bodyJson.event.text.replace(/<@\w+>/g, "").trim();
      (async () => {
        eventAnswer = await getChatGPTAnswer(question, env.OPENAI_API_KEY);
        await slackPostMessage(eventAnswer, threadTs, env.SLACK_BOT_TOKEN, env.SLACK_CHANNELL_NAME);
      })(); // async
      if (eventAnswer.statusCode == 200) {
        eventAnswer.message = "";
      }

      break;
    }
    case "slashCommand": {
      eventAnswer.statusCode = 200;
      eventAnswer.contentType = "application/json";
			eventAnswer.message = '{test: "", response_type: "in_channel"}';
      eventAnswer.routingType = "slashCommand";

			const qs:QsMap = parseQueryString(requestBody);
      const question = qs['text'];
      const responseUrl = qs["response_url"];

			(async () => {
      	eventAnswer = await getChatGPTAnswer(question, env.OPENAI_API_KEY);
				const res = await fetch(responseUrl,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							text: (JSON.parse(eventAnswer.message)).text,
							response_type: "in_channel",
						}),
					})
			})(); // async
      break;
    }
  }
  console.debug(eventAnswer);
  return eventAnswer;
};

function handleRoutingType(requestBody: string, requestMethod: string, requestURL: string, requestContentType: string, slashCommand: string, slashcommand_path: string): RoutingType {
  console.debug(requestBody);
  let routingType: RoutingType = "none";
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
			const command = parseQueryString(requestBody)['command'];
			if(pathtext == `/${slashcommand_path}` && command == `/${slashCommand}`) {
      	routingType = "slashCommand";
			}
    }
  }
  return routingType;
}

function parseQueryString(requestBody: string): QsMap {
	const qsMap: QsMap = {};

	const params = requestBody.split("&");
	for (const entry of params.entries()) {
		const t = entry[1].split("=");
		qsMap[t[0]] = decodeURIComponent(t[1]);
	}
	console.debug(qsMap);
	return qsMap;
}

interface QsMap {
	[name: string]: string;
}