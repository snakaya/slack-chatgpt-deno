import { EventAnswer } from "../types/eventAnswer.d.ts";

export default async (answer: EventAnswer, threadTs: string, slackBotToken: string, channelName: string): Promise<EventAnswer> => {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${slackBotToken}`,
    },
    body: JSON.stringify({
      "text": JSON.parse(answer.message).text,
      "channel": channelName,
      "thread_ts": threadTs,
    }),
  };
  console.debug(options);
  try {
    // deno-lint-ignore no-unused-vars
    const res = await fetch(
      "https://slack.com/api/chat.postMessage",
      options,
    );
  } catch (e) {
    console.debug(`Slack post error: [${e}]`);
  }

  return answer;
};
