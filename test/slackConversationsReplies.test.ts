import { assertEquals } from "https://deno.land/std@0.176.0/testing/asserts.ts";
import * as mod from "https://deno.land/std@0.176.0/testing/bdd.ts";
import { stub } from "https://deno.land/std@0.176.0/testing/mock.ts";
import { SlackConversationsReplies } from "../src/handlers/slackConversationsReplies.ts";

export const slackConversationsReplies = { SlackConversationsReplies };

const conversationsRepliesNormal1 = {"messages":[
	{"type":"message","user":"U061F7AUR0","text":"island","thread_ts":"1482960137.003543",	"reply_count":3,"subscribed":true,"last_read":"1484678597.521003","unread_count":0,"ts":"1482960137.003543"},
	{"type":"message","user":"U061F7AUR1","text":"oneisland","thread_ts":"1482960137.003543","parent_user_id":"U061F7AUR","ts":"1483037603.017503"},
	{"type":"message","user":"U061F7AUR2","text":"twoisland","thread_ts":"1482960137.003543","parent_user_id":"U061F7AUR","ts":"1483051909.018632"},
	{"type":"message","user":"U061F7AUR3","text":"threefortheland","thread_ts":"1482960137.003543","parent_user_id":"U061F7AUR","ts":"1483125339.020269"}
	],"has_more":true,"ok":true,"response_metadata":{"next_cursor":"bmV4dF90czoxNDg0Njc4MjkwNTE3MDkx"}};

const threadTs = "1675272716.780529";
const slack_bot_token: string = 'SlackBotToken';
const channel_id: string = 'ChannelId';

mod.describe("slackConversationsReplies Normal", () => {
  mod.it("Normal Request", async () => {
		const fetchStub = stub(globalThis, "fetch", () => Promise.resolve(new Response(JSON.stringify(conversationsRepliesNormal1), {status: 200,	headers: {"Content-Type": 'application/json; charset=utf-8',}})));
		try {
			const testAnswer = await slackConversationsReplies.SlackConversationsReplies(threadTs, channel_id, slack_bot_token);
			console.debug(testAnswer);
			assertEquals(testAnswer.statusCode, 200);
			assertEquals(testAnswer.contentType, "application/json; charset=utf-8");
			const testMessages = conversationsRepliesNormal1.messages;
			for(const [idx, entry] of JSON.parse(testAnswer.message).messages.entries()) {
				assertEquals(entry.user, conversationsRepliesNormal1.messages[idx].user);
				assertEquals(entry.text, conversationsRepliesNormal1.messages[idx].text);
			};
		} finally {
			fetchStub.restore();
		}
	});
});
mod.describe("slackConversationsReplies Error", () => {
  mod.it("StatusCode is 500", async () => {
		const fetchStub = stub(globalThis, "fetch", () => Promise.resolve(new Response(JSON.stringify(conversationsRepliesNormal1), {status: 500,	headers: {"Content-Type": 'application/json; charset=utf-8',}})));
		try {
			const testAnswer = await slackConversationsReplies.SlackConversationsReplies(threadTs, channel_id, slack_bot_token);
			console.debug(testAnswer);
			assertEquals(testAnswer.statusCode, 500);
			assertEquals(testAnswer.contentType, "text/plain");
			assertEquals(testAnswer.message.startsWith("Unknown other error"), true);
		} finally {
			fetchStub.restore();
		}
	});
	mod.it("slackConversationsReplies status error", async () => {
		const conversationsRepliesError = conversationsRepliesNormal1;
		conversationsRepliesError.ok = false;
		const fetchStub = stub(globalThis, "fetch", () => Promise.resolve(new Response(JSON.stringify(conversationsRepliesError), {status: 200,	headers: {"Content-Type": 'application/json; charset=utf-8',}})));
		try {
			const testAnswer = await slackConversationsReplies.SlackConversationsReplies(threadTs, channel_id, slack_bot_token);
			console.debug(testAnswer);
			assertEquals(testAnswer.statusCode, 500);
			assertEquals(testAnswer.contentType, "text/plain");
			assertEquals(testAnswer.message.startsWith("Unknown other error"), true);
		} finally {
			fetchStub.restore();
		}
	});
});
