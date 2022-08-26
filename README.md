# owen-wilson-discord

A discord bot that uses the [owen-wilson-wow-api](https://owen-wilson-wow-api.herokuapp.com/) to deliver content.

## Configuration

### Dependencies

Most dependencies are installed via `npm` with the exception of `ffmpeg`. It can be installed with your favorite package manager, downloaded from [their website](https://ffmpeg.org/), or you can `npm i -E ffmpeg-static` as a slower alternative.

### Environment Variables

There are some environment variables that are expected to be set. You can create a `.env` file in the project root which is loaded by `dotenv`. It is not committed to git to keep the data private.

| Variable         | Value                    | Environment |
| ---------------- | ------------------------ | ----------- |
| `NODE_ENV`       | `development,production` | N/A         |
| `APPLICATION_ID` | `your-application-id`    | Both        |
| `CLIENT_ID`      | `your-client-id`         | Development |
| `GUILD_ID`       | `your-test-guild-id`     | Development |
| `TOKEN`          | `your-bot-token`         | Both        |
| `DEBUG`          | `true,false`             | Both        |
