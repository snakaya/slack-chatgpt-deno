import { assertEquals } from "https://deno.land/std@0.176.0/testing/asserts.ts";
import * as mod from "https://deno.land/std@0.176.0/testing/bdd.ts";
import { stub } from "https://deno.land/std@0.176.0/testing/mock.ts";
import { GetChatGPTAnswer } from "../src/handlers/getChatGPTAnswer.ts";

export const getChatGPTAnswer = { GetChatGPTAnswer };

const chatgptResponseNormal1 = {"id":"cmpl-6xxxN24yGVavz1AOPlKxxx9ENv2As","object":"text_completion","created":1675280637,
	"model":"text-davinci-003","choices":[{"text":"Yes, 3 is a prime number.","index":0,"logprobs":null,"finish_reason":"stop"}],"usage":{"prompt_tokens":17,"completion_tokens":13,"total_tokens":30}};

const question: string = 'Is 3 a prime number?';
const openai_api_key: string = 'OPENAI_API_KEY';

mod.describe("getChatGPTAnswer Normal", () => {
  mod.it("Normal Request", async () => {
		const fetchStub = stub(globalThis, "fetch", () => Promise.resolve(new Response(JSON.stringify(chatgptResponseNormal1), {status: 200,	headers: {"Content-Type": 'application/json; charset=utf-8',}})));
		try {
			const testAnswer = await getChatGPTAnswer.GetChatGPTAnswer(question, openai_api_key);
			console.debug(testAnswer);
			assertEquals(testAnswer.statusCode, 200);
			assertEquals(testAnswer.contentType, "application/json; charset=utf-8");
			assertEquals(JSON.parse(testAnswer.message).text, chatgptResponseNormal1.choices[0].text);
		} finally {
			fetchStub.restore();
		}
	});
});
mod.describe("getChatGPTAnswer Error", () => {
  mod.it("StatusCode is 500", async () => {
		const fetchStub = stub(globalThis, "fetch", () => Promise.resolve(new Response(JSON.stringify(chatgptResponseNormal1), {status: 500,	headers: {"Content-Type": 'application/json; charset=utf-8',}})));
		try {
			const testAnswer = await getChatGPTAnswer.GetChatGPTAnswer(question, openai_api_key);
			console.debug(testAnswer);
			assertEquals(testAnswer.statusCode, 500);
			assertEquals(testAnswer.contentType, "text/plain");
			assertEquals(testAnswer.message.startsWith("Unknown other error"), true);
		} finally {
			fetchStub.restore();
		}
	});
});
