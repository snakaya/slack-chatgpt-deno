import { EventAnswer } from "../../src/types/eventAnswer.d.ts";

export default async (question: string, openaiAPIKey: string): Promise<EventAnswer> => {
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
        "model": "text-davinci-003",
        "prompt": question + "\n\n###\n\n",
        "temperature": 0,
        "max_tokens": 2048,
        "frequency_penalty": 0.0,
        "presence_penalty": 0.0,
        "stop": '[" END", "###"]',
      }),
    };
    console.debug(question);
    console.debug(JSON.stringify(options));
    const res = await fetch(
      "https://api.openai.com/v1/completions",
      options,
    );
    // deno-lint-ignore no-explicit-any
    const responseAnswer: any = await res.json();

    console.debug(JSON.stringify(responseAnswer));
    answer.statusCode = 200;
    answer.contentType = "application/json";
    answer.message = JSON.stringify({
      text: (responseAnswer.choices[0].text || "").trim(),
    });
    return answer;
  } catch (e) {
    console.debug(`Unkown other error: [${e}]`);
    answer.statusCode = 500;
    answer.message = `Unknown other error: [${e}]`;
    return answer;
  }
};
