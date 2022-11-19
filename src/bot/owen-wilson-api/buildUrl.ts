import { URL } from "url";
import { IOrderedWowParams, IRandomWowParams } from "./types";

const hostname = "https://owen-wilson-wow-api.onrender.com";

export const buildUrl = (
  endpoint: string,
  query: IRandomWowParams | IOrderedWowParams = {}
): URL => {
  const url = new URL(`${hostname}${endpoint}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  return url;
};
