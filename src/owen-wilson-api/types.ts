export interface IWowVideo {
  "1080p": string;
  "720p": string;
  "480p": string;
  "360p": string;
}

export enum WowSort {
  movie = "movie",
  release_date = "release_date",
  year = "year",
  director = "director",
  number_current_wow = "number_current_wow",
}

export enum WowDirection {
  asc = "asc",
  desc = "desc",
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

export interface IRandomWowParams {
  results?: number | null;
  year?: number | null;
  movie?: string | null;
  director?: string | null;
  wowsInMovie?: string | null;
  sort?: WowSort | null;
  direction?: WowDirection | null;
}

export interface IOrderedWowParams {
  index: number;
}

export type IMetaResponse = string;
