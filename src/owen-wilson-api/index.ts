import { URL } from "url";
import { fetch } from "./fetch";

// Define params and responses for wowpi
interface IWowVideo {
  "1080p": string;
  "720p": string;
  "480p": string;
  "360p": string;
}

export enum WowSort {
  Movie = "movie",
  ReleaseDate = "release_date",
  Year = "year",
  Director = "director",
  NumberCurrentWow = "number_current_wow",
}

export enum WowDirection {
  ASC = "asc",
  DESC = "desc",
}

export interface IWowResponse {
  movie: string;
  year: number;
  release_date: string;
  director: string;
  character: string;
  movie_duration: string;
  timestamp: string;
  full_line: string;
  current_wow_in_movie: number;
  total_wows_in_movie: number;
  poster: string;
  video: IWowVideo;
  audio: string;
}

interface IRandomWowParams {
  results?: number | null;
  year?: number | null;
  movie?: string | null;
  director?: string | null;
  wowsInMovie?: string | null;
  sort?: WowSort | null;
  direction?: WowDirection | null;
}

interface IOrderedWowParams {
  index: number;
}

const hostname = "https://owen-wilson-wow-api.herokuapp.com";

export const random = (
  params: IRandomWowParams = {}
): Promise<IWowResponse[]> => {
  const url = new URL(`${hostname}/wows/random`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  return fetch(url);
};

export const ordered = async ({
  index,
}: IOrderedWowParams): Promise<IWowResponse[]> => {
  const response = await fetch(new URL(`${hostname}/wows/ordered/${index}`));
  // Responses with a single index are returned without array wrapper
  return Array.isArray(response) ? response : [response];
};
