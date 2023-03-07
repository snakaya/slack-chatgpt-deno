import { EventAnswer } from "../types/eventAnswer.d.ts";

export async function SlackConversationsReplies(threadTs: string, channelId: string, slackBotToken: string): Promise<EventAnswer> {
	let answer: EventAnswer = {
    statusCode: 400,
    contentType: "text/plain",
    message: "Unknown error"
  };
	try {
		const options = {
			method: "GET",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"Authorization": `Bearer ${slackBotToken}`,
			},
		};
		const queryString = (new URLSearchParams({"channel": channelId, "ts": threadTs})).toString();
		console.debug(options);
		console.debug(`https://slack.com/api/conversations.replies?${queryString}`);
    // deno-lint-ignore no-unused-vars
    const res = await fetch(
      `https://slack.com/api/conversations.replies?${queryString}`,
      options,
    );
		if(res.status != 200) {
			console.error(`Response Status: ${res.status} ${res.statusText}`);
			throw new Error(`Response Status: ${res.status} ${res.statusText}`);
		}
		// deno-lint-ignore no-explicit-any
    const responseAnswer: any = await res.json();
		if(!responseAnswer.ok) {
			throw new Error('Slack Response error');
		}
		console.debug(JSON.stringify(responseAnswer));
    answer.statusCode = res.status;
    answer.contentType = res.headers.get("Content-Type") || "";
    answer.message = JSON.stringify(responseAnswer);
  } catch (e) {
    console.error(`Unkown other error: [${e}]`);
		answer.statusCode = 500;
    answer.message = `Unknown other error: [${e}]`;
  }
  return answer;
};
