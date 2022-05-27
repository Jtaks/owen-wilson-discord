import { fetch } from "../../utils/fetch";
import { buildUrl } from "../buildUrl";
import { IMetaResponse } from "../types";

export const directors = async (): Promise<IMetaResponse[]> =>
  fetch(buildUrl("/wows/directors"));
