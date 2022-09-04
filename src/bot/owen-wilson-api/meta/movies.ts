import { fetch } from "../../../lib/fetch";
import { buildUrl } from "../buildUrl";
import { IMetaResponse } from "../types";

export const movies = async (): Promise<IMetaResponse[]> =>
  fetch(buildUrl("/wows/movies"));
