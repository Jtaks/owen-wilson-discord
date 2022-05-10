import {
  SlashCommandBuilder,
  SlashCommandIntegerOption,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
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
    selfDeaf: true,
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

const getWow = (
  options: CommandInteraction["options"]
): Promise<WowPI.IWowResponse[]> => {
  if (options.getSubcommand() === "indexed") {
    // Ordered wow returned as single object
    return WowPI.ordered({ index: options.getInteger("index", true) });
  }

  return WowPI.random({
    // TODO
    // results: options.getNumber("results"),
    year: options.getNumber("year"),
    movie: options.getString("movie"),
    director: options.getString("director"),
    wowsInMovie: options.getString("wows_in_movie"),
    // TODO
    // sort: WowPI.WowSort[options.getString("sort") ?? WowPI.WowSort.Movie],
    // direction: WowPI.WowDirec[options.getString("direction")],
  });
};

const data = new SlashCommandBuilder()
  .setName("voice")
  .setDescription("Have owen-wilson-bot join your voice channel and says wow!")
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("random")
      .setDescription("Says a random wow!")
      // TOOD
      // .addNumberOption(
      //   new SlashCommandNumberOption()
      //     .setName("results")
      //     .setDescription("Picks a specific number of random wows.")
      //     .setMinValue(1)
      //     .setMaxValue(10)
      // )
      .addNumberOption(
        new SlashCommandNumberOption()
          .setName("year")
          .setDescription("Picks a random wow from a specific year.")
          .setMinValue(0)
      )
      .addStringOption(
        new SlashCommandStringOption()
          .setName("movie")
          .setDescription(
            "Picks a random wow by the name of the movie it appears in."
          )
      )
      .addStringOption(
        new SlashCommandStringOption()
          .setName("director")
          .setDescription(
            "Picks a random wow from a movie with a particular director."
          )
      )
      .addStringOption(
        new SlashCommandStringOption()
          .setName("wows_in_movie")
          .setDescription(
            "Picks a random wow by the number of its occurrence in a movie."
          )
      )
    // TODO
    // .addStringOption(
    //   new SlashCommandStringOption()
    //     .setName("sort")
    //     .setDescription("Sort multiple random results.")
    //     .addChoices(
    //       { name: WowPI.WowSort.Movie, value: WowPI.WowSort.Movie },
    //       {
    //         name: WowPI.WowSort.ReleaseDate,
    //         value: WowPI.WowSort.ReleaseDate,
    //       },
    //       { name: WowPI.WowSort.Year, value: WowPI.WowSort.Year },
    //       { name: WowPI.WowSort.Director, value: WowPI.WowSort.Director },
    //       {
    //         name: WowPI.WowSort.NumberCurrentWow,
    //         value: WowPI.WowSort.NumberCurrentWow,
    //       }
    //     )
    // )
    // .addStringOption(
    //   new SlashCommandStringOption()
    //     .setName("direction")
    //     .setDescription(
    //       "Sort direction can be either ascending or descending."
    //     )
    //     .addChoices(
    //       { name: WowPI.WowDirection.ASC, value: WowPI.WowDirection.ASC },
    //       { name: WowPI.WowDirection.DESC, value: WowPI.WowDirection.DESC }
    //     )
    // )
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("indexed")
      .setDescription("Says a specific wow!")
      .addIntegerOption(
        new SlashCommandIntegerOption()
          .setName("index")
          .setDescription("The wow number to play")
          .setMinValue(0)
          .setMaxValue(90)
          .setRequired(true)
      )
  );

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
      content: "Join a voice channel, silly!",
      ephemeral: true,
    });
    return;
  }

  interaction.deferReply();
  const [connection, [wow]] = await Promise.all([
    connectToChannel(channel),
    getWow(interaction.options),
  ]);

  if (!wow) {
    interaction.editReply("I couldn't find a wow matching your search :(");
    return;
  }

  connection.subscribe(player);
  await playWow(wow.audio);

  interaction.editReply(
    `${wow.character} says **wow** in ${wow.director}'s movie: ${wow.movie} (${wow.year})\n> ${wow.full_line}`
  );
};

module.exports = { data, execute };
