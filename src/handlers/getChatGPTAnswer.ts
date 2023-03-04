import { EventAnswer } from "../../src/types/eventAnswer.d.ts";

export async function GetChatGPTAnswer(question: string, openaiAPIKey: string): Promise<EventAnswer> {
  // deno-lint-ignore prefer-const
  let answer: EventAnswer = {
    statusCode: 400,
    contentType: "text/plain",
    message: `Unknown error: [${question}]`,
  };
  try {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiAPIKey}`,
      },
      body: JSON.stringify({
        "model": "gpt-3.5-turbo",
				"messages": [{"role": "user", "content": question}],
        "temperature": 1,
        "frequency_penalty": 0.0,
        "presence_penalty": 1.0
      }),
    };
    console.debug(question);
    console.debug(JSON.stringify(options));
    const res = await fetch(
      "https://api.openai.com/v1/chat/completions",
      options,
    );
		if(res.status != 200) {
			console.error(`Response Status: ${res.status} ${res.statusText}`);
			throw new Error(`Response Status: ${res.status} ${res.statusText}`);
		}
    // deno-lint-ignore no-explicit-any
    const responseAnswer: any = await res.json();

    console.debug(JSON.stringify(responseAnswer));
    answer.statusCode = 200;
    answer.contentType = "application/json; charset=utf-8";
    answer.message = JSON.stringify({
      text: (responseAnswer.choices[0].message.content || "").trim(),
    });
  } catch (e) {
    console.error(`Unkown other error: [${e}]`);
    answer.statusCode = 500;
    answer.message = `Unknown other error: [${e}]`;
  }
	return answer;
};
