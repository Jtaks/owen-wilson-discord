import * as https from "https";
import { URL, URLSearchParams } from "url";
import { log } from "../../lib/logger";

export const fetch = <T>(
  options: https.RequestOptions | URL | string,
  body: { [key: string]: any } = {}
): Promise<T> =>
  new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let encodedData = "";

      res.on("data", (data) => {
        encodedData += data;
      });

      res.on("end", () => {
        const contentType = res.headers?.["content-type"]?.toString() ?? "";
        let decodedData;

        if (contentType.includes("application/json")) {
          decodedData = JSON.parse(encodedData);
        } else {
          log(`Response contains unhandled content-type '${contentType}'`);
          decodedData = encodedData;
        }

        if (res.statusCode && res.statusCode > 299) {
          reject(encodedData);
        }

        resolve(decodedData);
      });
    });

    // If options is https.RequestOptions with a post method include the body
    if (
      typeof options === "object" &&
      !(options instanceof URL) &&
      options.method === "POST"
    ) {
      const contentType = options.headers?.["Content-Type"]?.toString() ?? "";
      let encodedData;

      if (contentType.includes("application/json")) {
        encodedData = JSON.stringify(body);
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        encodedData = new URLSearchParams(body).toString();
      } else {
        log(`Request contains unhandled content-type: ${contentType}`);
        encodedData = body;
      }

      req.write(encodedData);
    }

    req.on("error", reject);
    req.end();
  });
