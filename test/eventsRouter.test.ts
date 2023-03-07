import { assertEquals } from "https://deno.land/std@0.176.0/testing/asserts.ts";
import * as mod from "https://deno.land/std@0.176.0/testing/bdd.ts";
import { stub } from "https://deno.land/std@0.176.0/testing/mock.ts";
import { EventsRouter, slackConversationsReplies, getChatGPTAnswer, slackWebhook, slackPostMessage} from "../src/eventsRouter.ts";
import { EventAnswer } from "../src/types/eventAnswer.d.ts";


const urlVerificationRequestNormal1 = {"token": "Jhj5dZrVaK7ZwHHjRyZWjbDl",	"challenge": "3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P", "type": "url_verification"};
const slashcommandRequestNormal1 = 'token=Jhj5dZrVaK7ZwHHjRyZWjbDl&team_id=T061EG9RZ&team_domain=testorg&channel_id=C020ET6RQJJ&channel_name=testchnnel&\
user_id=U061F1EUR&user_name=testuser&command=%2Fslashcommand&text=Is%203%20a%20prime%20number%3F&api_app_id=A0FFV41KK&is_enterprise_install=false&\
response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT061EG9RZ%2F123456%2FabcdefgN&trigger_id=4736486097024.668910463318.363ea379d2caaa0840e778e7321c5edb';
const eventRequestNormal1 = {"token":"Jhj5dZrVaK7ZwHHjRyZWjbDl","team_id":"T061EG9RZ","api_app_id":"A0FFV41KK",
	"event":{"client_msg_id":"c4ed08c5-2468-480e-80a1-3feaa6e8bb74", "type":"app_mention","text":"<@U12345> Is%203%20a%20prime%20number%3F","user":"U061F1EUR","ts":"1674962756.608979",
	"blocks":[{"type":"rich_text","block_id":"svf","elements":[{"type":"rich_text_section","elements":[{"type":"user","user_id":"U12345"},{"type":"text","text":" Is%203%20a%20prime%20number%3F"}]}]}],
	"team":"T061EG9RZ","channel":"C061EG9SL","event_ts":"1674962756.608979"},"type":"event_callback","event_id":"Ev9UQ52YNA","event_time":1674962756,
	"authorizations":[{"enterprise_id":null,"team_id":"T061EG9RZ","user_id":"U12345","is_bot":true,"is_enterprise_install":false}],
	"is_ext_shared_channel":false,"event_context":"4-eyJldCI6ImFwcF9tZW50aW9uIiwidGlkIjoiVDA2MUVHOVJaIiwiYWlkIjoiQTAxMjM0NTYiLCJxaWQiOiJDMDEyMzQ1NiJ9"};
const tokenNormal1 = "Jhj5dZrVaK7ZwHHjRyZWjbDl";

const slackConversationsRepliesNormal1 = {"messages":[
	{"type":"message","user":"U061F7AUR0","text":"island","thread_ts":"1482960137.003543",	"reply_count":3,"subscribed":true,"last_read":"1484678597.521003","unread_count":0,"ts":"1482960137.003543"},
	{"type":"message","user":"U061F7AUR1","text":"oneisland","thread_ts":"1482960137.003543","parent_user_id":"U061F7AUR","ts":"1483037603.017503"},
	{"type":"message","user":"U12345","text":"twoisland","thread_ts":"1482960137.003543","parent_user_id":"U061F7AUR","ts":"1483051909.018632"},
	{"type":"message","user":"U061F7AUR3","text":"threefortheland","thread_ts":"1482960137.003543","parent_user_id":"U061F7AUR","ts":"1483125339.020269"}
	],"has_more":true,"ok":true,"response_metadata":{"next_cursor":"bmV4dF90czoxNDg0Njc4MjkwNTE3MDkx"}};
const chatgptResponseNormal1 = {"id":"cmpl-6xxxN24yGVavz1AOPlKxxx9ENv2As","object":"chat.completion","created":1677921284,
	"model":"gpt-3.5-turbo-0301","usage":{"prompt_tokens":14,"completion_tokens":11,"total_tokens":25},
	"choices":[{"message":{"role":"assistant","content":"\n\nNo, 3 is a prime number."},"finish_reason":"stop","index":0}]};
const slashcommandResponseNormal1 = 'ok';

let envvars = {
	SLACK_BOT_TOKEN: "SLACK_BOT_TOKEN",
	SLACK_SIGNING_SECRET: tokenNormal1,
	SLACK_CHANNELL_NAME: "SLACK_CHANNELL_NAME",
	SLACK_SLASHCOMMAND: "/slashcommand",
	SLACK_SLASHCOMMAND_REQUEST_PATH: "/slashcommand",
	OPENAI_API_KEY: "OPENAI_API_KEY",
};
const repliesAnswer: EventAnswer = {
	statusCode: 200,
	contentType: "application/json; charset=utf-8",
	message: JSON.stringify(slackConversationsRepliesNormal1),
	routingType: "appMention",
};
const gptAnswer: EventAnswer = {
	statusCode: 200,
	contentType: "application/json; charset=utf-8",
	message: JSON.stringify({
		text: (chatgptResponseNormal1.choices[0].message.content || "").trim(),
	}),
	routingType: "slashCommand",
};
const repliesStub = stub(slackConversationsReplies, "SlackConversationsReplies", () => Promise.resolve(repliesAnswer));
const gptStub = stub(getChatGPTAnswer, "GetChatGPTAnswer", () => Promise.resolve(gptAnswer));
const webhookStub = stub(slackWebhook, "SlackWebhook", () => Promise.resolve(new Response(slashcommandResponseNormal1, {status: 200,	headers: {"Content-Type": 'text/html',}})));
const postmessageStub = stub(slackPostMessage, "SlackPostMessage", () => Promise.resolve(gptAnswer));

mod.describe("eventsRouter Normal", () => {
  mod.it("URL Verification Request (Normal)", () => {
		const eventsRouter = EventsRouter(JSON.stringify(urlVerificationRequestNormal1), 'POST', 'https://example.com/slack/events', 'application/json', envvars);
  	const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 200);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message, urlVerificationRequestNormal1.challenge);
	});
	mod.it("SlashCommand Request (Normal)", async () => {
		const eventsRouter = EventsRouter(JSON.stringify(slashcommandRequestNormal1), 'POST', 'https://example.com/slashcommand', 'application/x-www-form-urlencoded', envvars);
		const testAnswer: EventAnswer = await eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 200);
		assertEquals(testAnswer.contentType, "application/json; charset=utf-8");
		assertEquals(testAnswer.message, '{text: "", response_type: "in_channel"}');
	});
	mod.it("app_mention Event Request (Normal)", async () => {
		const eventsRouter = EventsRouter(JSON.stringify(eventRequestNormal1), 'POST', 'https://example.com/slack/events', 'application/json', envvars);
		const testAnswer: EventAnswer = await eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 200);
		assertEquals(testAnswer.contentType, "");
		assertEquals(testAnswer.message, "");
	});
});
mod.describe("eventsRouter General Error", () => {
	mod.it("BodyData is not valid JSON", () => {
		const eventsRouter = EventsRouter('xxxxxx&vvvvvv', 'POST', 'https://example.com/slack/events', 'application/json', envvars);
		const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 500);
		assertEquals(testAnswer.contentType, "text/plain");
		assertEquals(testAnswer.message.startsWith("Other error happaned:"), true);
		assertEquals(testAnswer.routingType, "none");
	});
	mod.it("BodyData has not valid QueryString(1)", () => {
		const eventsRouter = EventsRouter('xxxxxx&vvvvvv', 'POST', 'https://example.com/slack/events', 'application/x-www-form-urlencoded', envvars);
		const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 404);
		assertEquals(testAnswer.contentType, "text/plain");
		assertEquals(testAnswer.message, "Not found routing: [POST] [https://example.com/slack/events]");
		assertEquals(testAnswer.routingType, "none");
	});
	mod.it("BodyData has not valid QueryString(2)", () => {
		const eventsRouter = EventsRouter('', 'POST', 'https://example.com/slack/events', 'application/x-www-form-urlencoded', envvars);
		const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 404);
		assertEquals(testAnswer.contentType, "text/plain");
		assertEquals(testAnswer.message, "Not found routing: [POST] [https://example.com/slack/events]");
		assertEquals(testAnswer.routingType, "none");
	});
	mod.it("Unset Method", () => {
		const eventsRouter = EventsRouter(JSON.stringify(slashcommandRequestNormal1), '', 'https://example.com/slack/events', 'application/x-www-form-urlencoded', envvars);
		const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 404);
		assertEquals(testAnswer.contentType, "text/plain");
		assertEquals(testAnswer.message, "Not found routing: [] [https://example.com/slack/events]");
		assertEquals(testAnswer.routingType, "none");
	});
	mod.it("Unset URL", () => {
		const eventsRouter = EventsRouter(JSON.stringify(slashcommandRequestNormal1), 'POST', '', 'application/x-www-form-urlencoded', envvars);
		const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 500);
		assertEquals(testAnswer.contentType, "text/plain");
		assertEquals(testAnswer.message.startsWith("Other error happaned:"), true);
		assertEquals(testAnswer.routingType, "none");
	});
	mod.it("Unset ContextType", () => {
		const eventsRouter = EventsRouter(JSON.stringify(slashcommandRequestNormal1), 'POST', 'https://example.com/slack/events', '', envvars);
		const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 404);
		assertEquals(testAnswer.contentType, "text/plain");
		assertEquals(testAnswer.message, "Not found routing: [POST] [https://example.com/slack/events]");
		assertEquals(testAnswer.routingType, "none");
	});
});
mod.describe("eventsRouter URL Verification Error", () => {
  mod.it("Unmatch Method", () => {
		const eventsRouter = EventsRouter(JSON.stringify(urlVerificationRequestNormal1), 'GET', 'https://example.com/slack/events', 'application/json', envvars);
  	const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 404);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message, "Not found routing: [GET] [https://example.com/slack/events]");
		assertEquals(testAnswer.routingType, "none");
	});
	mod.it("Unmatch URLPath", () => {
		const eventsRouter = EventsRouter(JSON.stringify(urlVerificationRequestNormal1), 'POST', 'https://example.com/slack/xevents', 'application/json', envvars);
  	const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 404);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message, "Not found routing: [POST] [https://example.com/slack/xevents]");
		assertEquals(testAnswer.routingType, "none");
	});
	mod.it("Unmatch ContextType", () => {
		const eventsRouter = EventsRouter(JSON.stringify(urlVerificationRequestNormal1), 'POST', 'https://example.com/slack/events', 'text/json', envvars);
  	const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 404);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message, "Not found routing: [POST] [https://example.com/slack/events]");
		assertEquals(testAnswer.routingType, "none");
	});
	mod.it("Unknown Request Type", () => {
		const urlVerificationRequestError = urlVerificationRequestNormal1;
		urlVerificationRequestError.type = 'xxxxxx';
		const eventsRouter = EventsRouter(JSON.stringify(urlVerificationRequestError), 'POST', 'https://example.com/slack/events', 'application/json', envvars);
  	const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 404);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message, "Not found routing: [POST] [https://example.com/slack/events]");
		assertEquals(testAnswer.routingType, "none");
	});
});
mod.describe("eventsRouter app_mention Event Error", () => {
  mod.it("Unmatch Method", () => {
		const eventsRouter = EventsRouter(JSON.stringify(eventRequestNormal1), 'GET', 'https://example.com/slack/events', 'application/json', envvars);
  	const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 404);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message, "Not found routing: [GET] [https://example.com/slack/events]");
		assertEquals(testAnswer.routingType, "none");
	});
	mod.it("Unmatch URLPath", () => {
		const eventsRouter = EventsRouter(JSON.stringify(eventRequestNormal1), 'POST', 'https://example.com/slack/xevents', 'application/json', envvars);
  	const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 404);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message, "Not found routing: [POST] [https://example.com/slack/xevents]");
		assertEquals(testAnswer.routingType, "none");
	});
	mod.it("Unmatch ContextType", () => {
		const eventsRouter = EventsRouter(JSON.stringify(eventRequestNormal1), 'POST', 'https://example.com/slack/events', 'text/json', envvars);
  	const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 404);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message, "Not found routing: [POST] [https://example.com/slack/events]");
		assertEquals(testAnswer.routingType, "none");
	});
	mod.it("Unknown Request Type", () => {
		const eventRequestError = eventRequestNormal1;
		eventRequestError.type = 'xxxxxx';
		const eventsRouter = EventsRouter(JSON.stringify(eventRequestError), 'POST', 'https://example.com/slack/events', 'application/json', envvars);
  	const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 404);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message, "Not found routing: [POST] [https://example.com/slack/events]");
		assertEquals(testAnswer.routingType, "none");
	});
});
mod.describe("eventsRouter SlashCommand Error", () => {
  mod.it("Unmatch Method", () => {
		const eventsRouter = EventsRouter(slashcommandRequestNormal1, 'GET', 'https://example.com/slashcommand', 'application/x-www-form-urlencoded', envvars);
  	const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 404);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message, "Not found routing: [GET] [https://example.com/slashcommand]");
		assertEquals(testAnswer.routingType, "none");
	});
	mod.it("Unmatch URLPath", () => {
		const eventsRouter = EventsRouter(slashcommandRequestNormal1, 'POST', 'https://example.com/xslashcommand', 'application/x-www-form-urlencoded', envvars);
  	const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 404);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message, "Not found routing: [POST] [https://example.com/xslashcommand]");
		assertEquals(testAnswer.routingType, "none");
	});
	mod.it("Unmatch ContextType", () => {
		const eventsRouter = EventsRouter(slashcommandRequestNormal1, 'POST', 'https://example.com/slashcommand', 'application/json', envvars);
  	const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 404);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message, "Not found routing: [POST] [https://example.com/slashcommand]");
		assertEquals(testAnswer.routingType, "none");
	});
	mod.it("Unknown Request Type", () => {
		const slashcommandRequestError = slashcommandRequestNormal1.replace('command=%2Fslashcommand', 'command=%2Fxslashcommand');
		const eventsRouter = EventsRouter(slashcommandRequestError, 'POST', 'https://example.com/slashcommand', 'application/x-www-form-urlencoded', envvars);
  	const testAnswer: EventAnswer = eventsRouter;
		console.debug(testAnswer);
		assertEquals(testAnswer.statusCode, 404);
    assertEquals(testAnswer.contentType, "text/plain");
    assertEquals(testAnswer.message, "Not found routing: [POST] [https://example.com/slashcommand]");
		assertEquals(testAnswer.routingType, "none");
	});
});


