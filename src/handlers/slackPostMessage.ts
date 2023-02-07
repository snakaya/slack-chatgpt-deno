import { EventAnswer } from "../types/eventAnswer.d.ts";

export async function SlackPostMessage(message: string, threadTs: string, slackBotToken: string, channelName: string): Promise<EventAnswer> {
	let answer: EventAnswer = {
    statusCode: 400,
    contentType: "text/plain",
    message: `Unknown error: [${message}]`,
  };
	try {
		const options = {
			method: "POST",
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"Authorization": `Bearer ${slackBotToken}`,
			},
			body: JSON.stringify({
				"text": message,
				"channel": channelName,
				"thread_ts": threadTs,
			}),
		};
		console.debug(options);
    // deno-lint-ignore no-unused-vars
    const res = await fetch(
      "https://slack.com/api/chat.postMessage",
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
