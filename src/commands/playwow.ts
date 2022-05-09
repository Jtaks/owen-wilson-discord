import { SlashCommandBuilder } from "@discordjs/builders";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  entersState,
  StreamType,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import { CommandInteraction, GuildMember, VoiceBasedChannel } from "discord.js";
import { createDiscordJSAdapter } from "../discord/adapter";
import * as WowPI from "../owen-wilson-api";

const player = createAudioPlayer();

function playWow(url: string) {
  const resource = createAudioResource(url, {
    inputType: StreamType.Arbitrary,
  });

  player.play(resource);

  return entersState(player, AudioPlayerStatus.Playing, 5e3);
}

async function connectToChannel(channel: VoiceBasedChannel) {
  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: createDiscordJSAdapter(channel),
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
    return connection;
  } catch (error) {
    connection.destroy();
    throw error;
  }
}

const data = new SlashCommandBuilder()
  .setName("test")
  .setDescription("Replies with a random wow!");

const execute = async (interaction: CommandInteraction) => {
  // voice does not exist on APIGuildMember so we perform a check here. Not sure
  // when if ever this would not be an instance of GuildMember.
  if (!(interaction.member instanceof GuildMember)) {
    console.error("Hey the thing happened! Take a look:");
    console.dir(interaction.member);
    interaction.reply("Somthing unique happened, tell Jesse so he can fix it.");
    return;
  }

  const channel = interaction.member?.voice.channel;
  if (!channel) {
    interaction.reply({
      content: "You are not in a voice channel!",
      ephemeral: true,
    });
    return;
  }

  interaction.deferReply();
  const [connection, [wow]] = await Promise.all([
    connectToChannel(channel),
    WowPI.random(),
  ]);
  connection.subscribe(player);
  await playWow(wow.audio);

  interaction.editReply(
    `${wow.character} says **wow** in ${wow.director}'s movie: ${wow.movie} (${wow.year})\n> ${wow.full_line}`
  );
};

module.exports = { data, execute };
