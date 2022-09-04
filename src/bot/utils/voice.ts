import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
  StreamType,
  VoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { CommandInteraction, Snowflake, VoiceBasedChannel } from "discord.js";
import * as WowPI from "../owen-wilson-api";
import { createDiscordJSAdapter } from "./adapter";

export const timeoutIdMap = new Map<Snowflake, NodeJS.Timeout>();

export const playWows = (
  interaction: CommandInteraction,
  player: AudioPlayer,
  wows: WowPI.IWowResponse[]
) => {
  let seeker = 1;
  player.on(AudioPlayerStatus.Idle, () => {
    if (seeker >= wows.length) {
      player.stop();
      return;
    }

    const wow = wows[seeker];
    const resource = createAudioResource(wow.audio, {
      inputType: StreamType.Arbitrary,
    });

    player.play(resource);
    seeker++;
  });

  const wow = wows[0];
  const resource = createAudioResource(wow.audio, {
    inputType: StreamType.Arbitrary,
  });

  player.play(resource);

  interaction.editReply(
    wows
      .map(
        (wow) =>
          `${wow.character} says **wow** in ${wow.director}'s movie: ${wow.movie} (${wow.year})\n> ${wow.full_line}`
      )
      .join("\n")
  );

  return entersState(player, AudioPlayerStatus.Playing, 5e3);
};

export const connectToChannel = async (
  channel: VoiceBasedChannel
): Promise<[VoiceConnection, AudioPlayer]> => {
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    selfDeaf: true,
    adapterCreator: createDiscordJSAdapter(channel),
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
  } catch (error) {
    connection.destroy();
    console.error("Error entering ready state when connecting to channel");
    throw error;
  }

  const player = createAudioPlayer();
  connection.subscribe(player);

  return [connection, player];
};

export const getWow = (
  options: CommandInteraction["options"]
): Promise<WowPI.IWowResponse[]> => {
  if (options.getSubcommand() === "ordered") {
    // Ordered wow returned as single object
    return WowPI.ordered({ index: options.getInteger("index", true) });
  }

  const sort = options.getString("sort") as WowPI.WowSort | undefined;
  const direction = options.getString("direction") as
    | WowPI.WowDirection
    | undefined;

  return WowPI.random({
    results: options.getNumber("results"),
    year: options.getNumber("year"),
    movie: options.getString("movie"),
    director: options.getString("director"),
    wowsInMovie: options.getString("wows_in_movie"),
    sort: WowPI.WowSort[sort ?? WowPI.WowSort.movie],
    direction: WowPI.WowDirection[direction ?? WowPI.WowDirection.asc],
  });
};
