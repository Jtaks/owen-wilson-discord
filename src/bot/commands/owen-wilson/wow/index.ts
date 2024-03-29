import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import {
  connectToChannel,
  getChannel,
  playWows,
  refreshConnectionTimeout,
} from "../../../utils/voice";
import { randomSubcommand } from "../voice/subcommands";

export const data = new SlashCommandBuilder()
  .setName("wow")
  .setDescription("Wow!");

export const execute = async (interaction: CommandInteraction) => {
  const channel = getChannel(interaction);
  if (!channel) {
    return;
  }

  await interaction.deferReply();
  const wows = await randomSubcommand.execute(interaction);
  if (!wows?.length) {
    interaction.editReply("I couldn't find a wow matching your search :(");
    return;
  }

  const [connection, player] = await connectToChannel(channel);
  await playWows(interaction, player, wows);
  refreshConnectionTimeout(channel, connection);
};
