# owen-wilson-discord

A discord bot that uses the [owen-wilson-wow-api](https://owen-wilson-wow-api.herokuapp.com/) to serve wows.

## Add to Discord Server

Click [here](https://discord.com/api/oauth2/authorize?client_id=855547405813153812&permissions=3145728&scope=bot) to `owen-wilson-discord` to your server.

## Slash Commands

### wow

Play a random wow in your current voice channel. Similar to [voice random](#voice-random) but without any options exposed.

### voice random

Play a random wow in your current voice channel.

Optionally filter results based on the following options:

| Option      | Value                                                   | Default | Required |
| ----------- | ------------------------------------------------------- | ------- | -------- |
| results     | number                                                  | 1       | no       |
| year        | number                                                  | -       | no       |
| movie       | string                                                  | -       | no       |
| director    | string                                                  | -       | no       |
| wowsInMovie | string                                                  | -       | no       |
| sort        | movie, release_date, year, director, number_current_wow | movie   | no       |
| direction   | asc,desc                                                | asc     | no       |

### voice ordered

Play a specific wow in your current voice channel.

| Option | Value  | Default | Required |
| ------ | ------ | ------- | -------- |
| index  | number | -       | yes      |

### video

Reply with a random video wow.

### meta directors

Reply with a list of directors where a wow is said.

### meta movies

Reply with a list of moview where a wow is said.

## Development Setup

### Dependencies

Most dependencies are installed via `npm` with the exception of `ffmpeg`. It can be installed with your favorite package manager, downloaded from [their website](https://ffmpeg.org/), or you can `npm i -E ffmpeg-static` as a slower alternative.

### Environment Variables

There are some environment variables that are expected to be set. You can create a `.env` file in the project root which is loaded by `dotenv`. It is not committed to git to keep the data private.

| Variable         | Value                    | Environment | Required |
| ---------------- | ------------------------ | ----------- | -------- |
| `APPLICATION_ID` | `your-application-id`    | Both        | Yes      |
| `TOKEN`          | `your-bot-token`         | Both        | Yes      |
| `NODE_ENV`       | `development,production` | N/A         | No       |
| `CLIENT_ID`      | `your-client-id`         | Development | No       |
| `GUILD_ID`       | `your-test-guild-id`     | Development | No       |
| `DEBUG`          | `true,false`             | Both        | No       |

#### NODE_ENV

`NODE_ENV` determines whether the bot is updates slash commands for a specific guild or all guilds. Use `production` when deploying for public use.

## Running

### Build

```
npm run build
```

This project uses typescript. Before running the bot we must compile the files to javascript.

### Start

There are two start scripts named according to their usage.

#### Development

```
npm run start:dev
```

This development script uses [nodemon](https://www.npmjs.com/package/nodemon) to enable file compilation and app restart when a file in the source directory is updated.

#### Production

```
npm run start:prod
```

This production script uses [pm2](https://www.npmjs.com/package/pm2) to enable background process and automatic restart on crash.

### Deploy

```
npm run deploy
```

Deploy will build and start the bot in production mode.

## Generating Discord URL

Using Discord's [OAuth2 URL Generator](https://discord.com/developers/applications/855547405813153812/oauth2/url-generator), generate a url with the following:

Scopes:

- bot

Bot Permissions:

- Connect
- Speak
