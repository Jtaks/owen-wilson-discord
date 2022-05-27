import {
  SlashCommandBuilder,
  SlashCommandIntegerOption,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
} from "@discordjs/builders";
import {
  joinVoiceChannel,
  getVoiceConnection,
  createAudioPlayer,
  createAudioResource,
  entersState,
  StreamType,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  AudioPlayer,
  VoiceConnection,
} from "@discordjs/voice";
import {
  CommandInteraction,
  GuildMember,
  Snowflake,
  VoiceBasedChannel,
} from "discord.js";
import { createDiscordJSAdapter } from "../utils/adapter";
import * as WowPI from "../owen-wilson-api";
import { IWowResponse } from "../owen-wilson-api";

const timeoutIdMap = new Map<Snowflake, NodeJS.Timeout>();

const playWows = (
  interaction: CommandInteraction,
  player: AudioPlayer,
  wows: IWowResponse[]
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

const connectToChannel = async (
  channel: VoiceBasedChannel
): Promise<[VoiceConnection, AudioPlayer]> => {
  const connection =
    getVoiceConnection(channel.guild.id) ??
    joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      selfDeaf: true,
      adapterCreator: createDiscordJSAdapter(channel),
    });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
  } catch (error) {
    connection.destroy();
    throw error;
  }

  const player = createAudioPlayer();
  connection.subscribe(player);

  return [connection, player];
};

const getWow = (
  options: CommandInteraction["options"]
): Promise<WowPI.IWowResponse[]> => {
  if (options.getSubcommand() === "indexed") {
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

const data = new SlashCommandBuilder()
  .setName("voice")
  .setDescription("Have owen-wilson-bot join your voice channel and says wow!")
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("random")
      .setDescription("Says a random wow!")
      .addNumberOption(
        new SlashCommandNumberOption()
          .setName("results")
          .setDescription("Picks a specific number of random wows.")
          .setMinValue(1)
          .setMaxValue(10)
      )
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
      .addStringOption(
        new SlashCommandStringOption()
          .setName("sort")
          .setDescription("Sort multiple random results.")
          .addChoices(
            { name: WowPI.WowSort.movie, value: WowPI.WowSort.movie },
            {
              name: WowPI.WowSort.release_date,
              value: WowPI.WowSort.release_date,
            },
            { name: WowPI.WowSort.year, value: WowPI.WowSort.year },
            { name: WowPI.WowSort.director, value: WowPI.WowSort.director },
            {
              name: WowPI.WowSort.number_current_wow,
              value: WowPI.WowSort.number_current_wow,
            }
          )
      )
      .addStringOption(
        new SlashCommandStringOption()
          .setName("direction")
          .setDescription(
            "Sort direction can be either ascending or descending."
          )
          .addChoices(
            { name: WowPI.WowDirection.asc, value: WowPI.WowDirection.asc },
            { name: WowPI.WowDirection.desc, value: WowPI.WowDirection.desc }
          )
      )
  )
  .addSubcommand(
    new SlashCommandSubcommandBuilder()
      .setName("ordered")
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
    interaction.reply({
      content: "Wow! Somthing unique happened, tell Jesse so he can fix it.",
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
  const wows = await getWow(interaction.options);

  if (!wows.length) {
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
    }, 60 * 1000 * 5)
  );
};

module.exports = { data, execute };
