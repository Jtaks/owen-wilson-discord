import { fetch } from "../../utils/fetch";
import { buildUrl } from "../buildUrl";
import { IOrderedWowParams, IWowResponse } from "../types";

export const ordered = async ({
  index,
}: IOrderedWowParams): Promise<IWowResponse[]> => {
  const response = await fetch(buildUrl(`/wows/ordered/${index}`));
  // Responses with a single index are returned without array wrapper
  return Array.isArray(response) ? response : [response];
};
