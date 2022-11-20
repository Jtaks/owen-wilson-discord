import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import {
  connectToChannel,
  getChannel,
  timeoutIdMap,
} from "../../../utils/voice";

export const data = new SlashCommandBuilder()
  .setName("leave")
  .setDescription("Make me leave the channel");

export const execute = async (interaction: CommandInteraction) => {
  const channel = getChannel(interaction);
  if (!channel) {
    return;
  }

  await interaction.deferReply();
  const isOwenInChannel = !!channel.members.find(
    (member) => member.user.bot && member.user.username === "owen-wilson-bot"
  );

  if (!isOwenInChannel) {
    interaction.editReply("Wow! I'm not in your channel");
    return;
  }

  const [connection] = await connectToChannel(channel);
  interaction.editReply("Bye! ❤️");
  connection.destroy();

  const existingTimout = timeoutIdMap.get(channel.guild.id);
  if (existingTimout) {
    clearTimeout(existingTimout);
  }
};
