import { FastifyBaseLogger } from "fastify";
import { getAppInstallationToken } from "./token";

const GITHUB_API_URL = "https://api.github.com";

let accessToken: string;

export async function refreshToken(log: FastifyBaseLogger) {
  if (process.env.GITHUB_APP_PRIVATE_KEY === undefined) {
    log.info("Starting without GitHub auth, subject to heavy rate limits");
    return;
  }
  log.info("Refreshing GitHub token");
  accessToken = await getAppInstallationToken();
  // refresh every 45 minutes
  setTimeout(() => refreshToken(log), 1000 * 60 * 45);
}

export async function fetchRepoInfo(
  log: FastifyBaseLogger,
  owner: string,
  repo: string
) {
  const options =
    accessToken === undefined
      ? {}
      : {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };
  const basePath = `${GITHUB_API_URL}/repos/${owner}/${repo}`;
  const [info, lang] = await Promise.all([
    fetch(`${basePath}`, options),
    fetch(`${basePath}/languages`, options),
  ]);

  const langData = await lang.json();
  const data = await info.json();
  data.langData = langData;

  if (!info.ok) {
    log.error(
      { headers: info.headers, data },
      `Failed to fetch repo info for ${owner}/${repo}`
    );
  }
  if (!lang.ok) {
    log.error(
      { headers: lang.headers, langData },
      `Failed to fetch repo languages for ${owner}/${repo}`
    );
  }

  return data;
}
