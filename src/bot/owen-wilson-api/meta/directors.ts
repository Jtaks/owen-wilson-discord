import { fetch } from "../../../lib/fetch";
import { buildUrl } from "../buildUrl";
import { IMetaResponse } from "../types";

export const getDirectors = async (): Promise<IMetaResponse[]> =>
  fetch(buildUrl("/wows/directors"));
