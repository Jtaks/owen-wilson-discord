# owen-wilson-discord

A discord bot that uses the [owen-wilson-wow-api](https://owen-wilson-wow-api.herokuapp.com/) to deliver content.

## Configuration

### Dependencies

Most dependencies are installed via `npm` with the exception of `ffmpeg`. It can be installed with your favorite package manager, downloaded from [their website](https://ffmpeg.org/), or you can `npm i -E ffmpeg-static` as a slower alternative.

### Environment Variables

There are some environment variables that are expected to be set. For local development a `.env` file is used. It is not committed to git to keep the data private. Create the file with your private data.

| Variable         | Value                  |
| ---------------- | ---------------------- |
| `APPLICATION_ID` | 'your-application-id   |
| `CLIENT_ID`      | `'your-client-id'`     |
| `GUILD_ID`       | `'your-test-guild-id'` |
| `TOKEN`          | `'your-bot-token'`     |
