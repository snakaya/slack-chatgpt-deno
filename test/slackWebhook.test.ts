import { assertEquals, assertNotEquals } from "https://deno.land/std@0.176.0/testing/asserts.ts";
import * as mod from "https://deno.land/std@0.176.0/testing/bdd.ts";
import { stub } from "https://deno.land/std@0.176.0/testing/mock.ts";
import { SlackWebhook } from "../src/handlers/slackWebhook.ts";

export const slackWebhook = { SlackWebhook };

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

mod.describe("slackWebhook Normal", () => {
  mod.it("Normal Request", async () => {
		const fetchStub = stub(globalThis, "fetch", () => Promise.resolve(new Response('ok', {status: 200,	headers: {"Content-Type": 'text/html'}})));
		try {
			const res = await slackWebhook.SlackWebhook(eventResponseNormail1.message.text, 'https://example.com/webhook');
			const resbody = await res.text();
			console.debug(res);
			assertEquals(res.status, 200);
			assertEquals(res.headers.get('Content-Type'), "text/html");
			assertEquals(resbody, 'ok');
		} finally {
			fetchStub.restore();
		}
	});
});
mod.describe("slackWebhook Error", () => {
  mod.it("StatusCode is 500", async () => {
		const fetchStub = stub(globalThis, "fetch", () => Promise.resolve(new Response('error', {status: 500,	headers: {"Content-Type": 'text/html',}})));
		try {
			const res = await slackWebhook.SlackWebhook(eventResponseNormail1.message.text, 'https://example.com/webhook');
			const resbody = await res.text();
			console.debug(res);
			assertEquals(res.status, 500);
			assertEquals(res.headers.get('Content-Type'), "text/html");
			assertNotEquals(resbody, 'ok');
		} finally {
			fetchStub.restore();
		}
	});
});