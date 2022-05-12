import { fetch } from "../../utils/fetch";
import { buildUrl } from "../buildUrl";
import { IRandomWowParams, IWowResponse } from "../types";

export const random = (
  params: IRandomWowParams = {}
): Promise<IWowResponse[]> => fetch(buildUrl("/wows/random", params));
