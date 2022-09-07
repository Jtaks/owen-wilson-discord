import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, GuildMember } from "discord.js";
import { connectToChannel, playWows, timeoutIdMap } from "../../utils/voice";
import { orderedSubcommand, randomSubcommand } from "./subcommands";

export const data = new SlashCommandBuilder()
  .setName("voice")
  .setDescription("Have owen-wilson-bot join your voice channel and says wow!");

data.addSubcommand(orderedSubcommand.data);
data.addSubcommand(randomSubcommand.data);

export const execute = async (interaction: CommandInteraction) => {
  if (!(interaction.member instanceof GuildMember)) {
    // Commands used outside a server (ex: private message)
    interaction.reply({
      content: "Wow, this command only works in a server!",
      ephemeral: true,
    });
    return;
  }

  const channel = interaction.member?.voice.channel;
  if (!channel) {
    interaction.reply({
      content: "Wow, join a voice channel!",
      ephemeral: true,
    });
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
