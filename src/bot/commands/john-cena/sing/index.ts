import { SlashCommandBuilder } from "@discordjs/builders";
import { StreamType } from "@discordjs/voice";
import { CommandInteraction } from "discord.js";
import { resolve } from "path";
import { mediaPath } from "../../../../config";
import {
  connectToChannel,
  getChannel,
  playAudio,
  refreshConnectionTimeout,
} from "../../../utils/voice";

const filePath = resolve(mediaPath, "bing-singing.mp3");

export const data = new SlashCommandBuilder()
  .setName("sing")
  .setDescription("Replies with John Cena's bing chilling song");

export const execute = async (interaction: CommandInteraction) => {
  const channel = getChannel(interaction);
  if (!channel) {
    return;
  }

  await interaction.deferReply();

  const [connection, player] = await connectToChannel(channel);
  playAudio(player, filePath, {
    inputType: StreamType.Arbitrary,
  });
  refreshConnectionTimeout(channel, connection);
  interaction.editReply("Karaoke time! 🎙️🎵");
};
