import {
  AudioPlayer,
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  CreateAudioResourceOptions,
  entersState,
  joinVoiceChannel,
  StreamType,
  VoiceConnection,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import {
  CommandInteraction,
  GuildMember,
  Snowflake,
  VoiceBasedChannel,
} from "discord.js";
import * as WowPI from "../owen-wilson-api";
import { createDiscordJSAdapter } from "./adapter";

export const timeoutIdMap = new Map<Snowflake, NodeJS.Timeout>();

export const refreshConnectionTimeout = (
  channel: VoiceBasedChannel,
  connection: VoiceConnection
) => {
  const existingTimout = timeoutIdMap.get(channel.guild.id);
  if (existingTimout) {
    clearTimeout(existingTimout);
  }

  timeoutIdMap.set(
    channel.guild.id,
    setTimeout(() => {
      connection.destroy();
      timeoutIdMap.delete(channel.guild.id);
    }, 60 * 1000 * 5)
  );
};

export const playAudio = (
  player: AudioPlayer,
  audioSource: string,
  audioOptions?: Omit<CreateAudioResourceOptions<null | undefined>, "metadata">
) => {
  const resource = createAudioResource(audioSource, audioOptions);
  player.play(resource);
};

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
    playAudio(player, wow.audio, {
      inputType: StreamType.Arbitrary,
    });

    seeker++;
  });

  const wow = wows[0];
  playAudio(player, wow.audio, {
    inputType: StreamType.Arbitrary,
  });

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

export const getChannel = (
  interaction: CommandInteraction
): VoiceBasedChannel | null => {
  if (!(interaction.member instanceof GuildMember)) {
    // Commands used outside a server (ex: private message)
    interaction.reply({
      content: "Wow, this command only works in a server!",
      ephemeral: true,
    });
    return null;
  }

  const channel = interaction.member?.voice.channel;
  if (!channel) {
    interaction.reply({
      content: "Wow, join a voice channel!",
      ephemeral: true,
    });
    return null;
  }

  return channel;
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
