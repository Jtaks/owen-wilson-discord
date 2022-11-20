import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import {
  connectToChannel,
  getChannel,
  playWows,
  refreshConnectionTimeout,
} from "../../../utils/voice";
import { orderedSubcommand, randomSubcommand } from "./subcommands";

export const data = new SlashCommandBuilder()
  .setName("voice")
  .setDescription("Have owen-wilson-bot join your voice channel and says wow!");

data.addSubcommand(orderedSubcommand.data);
data.addSubcommand(randomSubcommand.data);

export const execute = async (interaction: CommandInteraction) => {
  const channel = getChannel(interaction);
  if (!channel) {
    return;
  }

  await interaction.deferReply();

  let wows = null;
  switch (interaction.options.getSubcommand()) {
    case orderedSubcommand.data.name: {
      wows = await orderedSubcommand.execute(interaction);
      break;
    }
    case randomSubcommand.data.name: {
      wows = await randomSubcommand.execute(interaction);
      break;
    }
    default: {
      interaction.editReply(`Unknown ${data.name} subcommand`);
      return;
    }
  }

  if (!wows?.length) {
    interaction.editReply("I couldn't find a wow matching your search :(");
    return;
  }

  const [connection, player] = await connectToChannel(channel);
  await playWows(interaction, player, wows);
  refreshConnectionTimeout(channel, connection);
};
