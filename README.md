# ChatGPT Slack Bot for Deno

This is a Slack Bot that uses the ChatGPT API to generate responses to messages in your Slack workspace. The bot is built using Deno and TypeScript, providing strong typing and a more scalable development experience.

## Features

- Generates responses to messages in your Slack workspace using the ChatGPT API
- Responds to mentions and slash commands
- Secure authentication using Slack's OAuth 2.0 flow
- Support Deno Deploy

## Requirements

- Deno 1.31.1 or later
- ChatGPT API key
- Slack App credentials (bot token, signing secret and more)
- Deno Deploy token

## Installation

1. Clone this repository:

	```bash
	git clone https://github.com/snakaya/slack-chatgpt-deno.git
	cd slack-chatgpt-deno
	```

1. Rename the .env-dist file to .env and modify its contents to match your environment. Replace the values with your own ChatGPT API key, Slack App credentials, and configuration values:

	```;
	SLACK_BOT_TOKEN=your-slack-bot-token
	SLACK_SIGNING_SECRET=your-slack-signing-secret
	SLACK_CHANNELL_NAME=post-to-channel-name
	SLACK_SLASHCOMMAND=your-slash-command
	SLACK_SLASHCOMMAND_REQUEST_PATH=your-slash-command-path-in-request
	CHATGPT_API_KEY=your-chatgpt-api-key
	SERVICE_PORT=port-for-localtest
	```

1. Deploy your application to Deno Deploy:

	```bash
	export DENO_DEPLOY_TOKEN=your-deno-deploy-token
	deployctl deploy --no-check --allow-net --allow-read --allow-env --env .env --project your-app-name --prod src/index.ts
	```

1. Create a slash command in your Slack workspace:

	- Command: /chatgpt
	- Request URL: https://your-bot-url.com/chatgpt
	- Short description: Generate a response using the ChatGPT API
	- 'chatgpt' command be could change using .env

1. Invite the bot to a channel in your Slack workspace:

	- Setup Event Subscriptions:
  	- Request URL: https://your-bot-url.com/slack/events
  	- 'Subscribe to bot events' to ```app_mention```


## Usage

Slash command:
```
/chatgpt your-question
```

App Mension:
```
@your-bot your-question
```

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/snakaya/slack-chatgpt-deno/blob/main/LICENSE) file for details.

--

*This document was prepared in collaboration with ChatGPT.*
