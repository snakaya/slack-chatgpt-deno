import { EventAnswer } from "../../src/types/eventAnswer.d.ts";
import { VerifySubscriptionJSON } from "../../src/types/verifySubscriptionJSON.d.ts";

export function verifySubscriptionURL(bodytext: string, slackBotToken: string): EventAnswer {
  // deno-lint-ignore prefer-const
  let answer: EventAnswer = {
    statusCode: 400,
    contentType: "text/plain",
    message: `Unknown error: [${bodytext}]`,
  };
  try {
    const bodyjson: VerifySubscriptionJSON = JSON.parse(bodytext);
		console.debug(bodyjson);
		console.debug(Object.keys(JSON.parse(bodytext)).sort().toString());
		if(Object.keys(JSON.parse(bodytext)).sort().toString() != ['token', 'challenge', 'type'].sort().toString()) {
			throw new Error('Parameter member is invalid');
		}
    if (bodyjson.type != "url_verification") {
      console.debug(`Unmatch type error: [${bodyjson.type}]`);
      answer.statusCode = 400;
      answer.message = `Unmatch type error: [${bodyjson.type}]`;
      return answer;
    }
    if (bodyjson.token != slackBotToken) {
      console.debug("Unmatch token error.");
      answer.statusCode = 400;
      answer.message = "Unmatch token error.";
      return answer;
    }
    answer.statusCode = 200;
    answer.message = bodyjson.challenge;
    return answer;
  } catch (e) {
    console.debug(`Unkown other error: [${bodytext}] e:[${e}]`);
    answer.statusCode = 500;
    answer.message = `Unknown other error: [${e}]`;
    return answer;
  }
};
