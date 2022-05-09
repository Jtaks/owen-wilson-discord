import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
const WowPI = require("../owen-wilson-api");

const data = new SlashCommandBuilder()
  .setName("wow")
  .setDescription("Replies with a random wow!");

const execute = async (interaction: CommandInteraction) => {
  console.log(interaction.user);
  await interaction.deferReply();
  const [wow] = await WowPI.random();
  interaction.editReply(wow.video["720p"]);
};

module.exports = { data, execute };
