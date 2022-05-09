import { URL } from "url";
import { fetch } from "./fetch";

// Define params and responses for wowpi
interface IWowVideo {
  "1080p": string;
  "720p": string;
  "480p": string;
  "360p": string;
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

const hostname = "https://owen-wilson-wow-api.herokuapp.com";

export const random = (
  params: { [key: string]: string } = {}
): Promise<IWowResponse[]> => {
  const url = new URL(`${hostname}/wows/random`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  return fetch(url);
};

export const ordered = async () => {};
