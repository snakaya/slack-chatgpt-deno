import { assertEquals } from "https://deno.land/std@0.176.0/testing/asserts.ts";
import * as mod from "https://deno.land/std@0.176.0/testing/bdd.ts";
import { stub } from "https://deno.land/std@0.176.0/testing/mock.ts";
import { SlackPostMessage } from "../src/handlers/slackPostMessage.ts";
import { EventAnswer } from "../src/types/eventAnswer.d.ts";

export const slackPostMessage = { SlackPostMessage };

const chatgptResponseNormal1 = {"id":"cmpl-6xxxN24yGVavz1AOPlKxxx9ENv2As","object":"text_completion","created":1675280637,
	"model":"text-davinci-003","choices":[{"text":"Yes, 3 is a prime number.","index":0,"logprobs":null,"finish_reason":"stop"}],"usage":{"prompt_tokens":17,"completion_tokens":13,"total_tokens":30}};
const eventResponseNormail1 = {"ok":true,"channel":"C061EG9SL","ts":"1675581769.130969","message":{"bot_id":"B0123456","type":"message",
"text":"Yes, 3 is a prime number.","user":"U04N7N2BGFJ","ts":"1675581769.130969","app_id":"A0FFV41KK",
"blocks":[{"type":"rich_text","block_id":"tZpm",
	"elements":[{"type":"rich_text_section",
		"elements":[{"type":"text","text":"Yes, 3 is a prime number."}]}]}],
"team":"T061EG9RZ",
"bot_profile":{"id":"B04XXXXXTJQ","app_id":"A0FFV41KK","name":"testapp",
	"icons":{"image_36":"https:\/\/avatars.slack-edge.com\/2023-02-01\/471000_6f3e_36.jpg","image_48":"https:\/\/avatars.slack-edge.com\/2023-02-01\/471000_6f3e_48.jpg","image_72":"https:\/\/avatars.slack-edge.com\/2023-02-01\/471000_6f3e_72.jpg"},
	"deleted":false,"updated":1675255977,"team_id":"T061EG9RZ"},
"thread_ts":"1675581766.467199","parent_user_id":"U12345"}};

const testAnswer: EventAnswer = {
	statusCode: 200,
	contentType: "application/json; charset=utf-8",
	message: JSON.stringify({
		text: (chatgptResponseNormal1.choices[0].text || "").trim(),
	}),
	routingType: "appMention",
};

const threadTs = "1675272716.780529";
const slack_bot_token: string = 'SlackBotToken';
const channel_name: string = 'ChannelName';

mod.describe("slackPostMessage Normal", () => {
  mod.it("Normal Request", async () => {
		const fetchStub = stub(globalThis, "fetch", () => Promise.resolve(new Response(JSON.stringify(eventResponseNormail1), {status: 200,	headers: {"Content-Type": 'application/json; charset=utf-8',}})));
		try {
			const resAnswer = await slackPostMessage.SlackPostMessage(JSON.parse(testAnswer.message).text, threadTs, slack_bot_token, channel_name);
			console.debug(resAnswer);
			assertEquals(resAnswer.statusCode, 200);
			//assertEquals(resAnswer.contentType, "application/json; charset=utf-8");
			//assertEquals(JSON.parse(testAnswer.message).text, chatgptResponseNormal1.choices[0].text);
		} finally {
			fetchStub.restore();
		}
	});
});
mod.describe("slackPostMessage Error", () => {
  mod.it("StatusCode is 500", async () => {
		const fetchStub = stub(globalThis, "fetch", () => Promise.resolve(new Response(JSON.stringify(eventResponseNormail1), {status: 500,	headers: {"Content-Type": 'application/json; charset=utf-8',}})));
		try {
			const resAnswer = await slackPostMessage.SlackPostMessage(JSON.parse(testAnswer.message).text, threadTs, slack_bot_token, channel_name);
			console.debug(resAnswer);
			assertEquals(resAnswer.statusCode, 500);
			assertEquals(resAnswer.contentType, "text/plain");
			assertEquals(resAnswer.message.startsWith("Unknown other error"), true);
		} finally {
			fetchStub.restore();
		}
	});
	mod.it("postMessage status error", async () => {
		const eventResponseError = eventResponseNormail1;
		eventResponseError.ok = false;
		const fetchStub = stub(globalThis, "fetch", () => Promise.resolve(new Response(JSON.stringify(eventResponseError), {status: 200,	headers: {"Content-Type": 'application/json; charset=utf-8',}})));
		try {
			const resAnswer = await slackPostMessage.SlackPostMessage(JSON.parse(testAnswer.message).text, threadTs, slack_bot_token, channel_name);
			console.debug(resAnswer);
			assertEquals(resAnswer.statusCode, 500);
			assertEquals(resAnswer.contentType, "text/plain");
			assertEquals(resAnswer.message.startsWith("Unknown other error"), true);
		} finally {
			fetchStub.restore();
		}
	});
});
