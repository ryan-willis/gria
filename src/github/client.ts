const GITHUB_API_URL = "https://api.github.com";
const SIMPLE_ICONS_URL = "https://cdn.simpleicons.org";

const LANGUAGE_RENAMES: Record<string, string> = {
  SCSS: "sass",
  HTML: "html5",
  Shell: "gnubash",
};

function getLanguageName(language: string) {
  return LANGUAGE_RENAMES[language] || language.toLowerCase();
}

export const fetchRepoInfo = async (owner: string, repo: string) => {
  const basePath = `${GITHUB_API_URL}/repos/${owner}/${repo}`;
  const info = fetch(`${basePath}`);
  const lang = await fetch(`${basePath}/languages`);

  const langData = await lang.json();

  const languageFetches = Object.keys(langData).map((language) => ({
    req: fetch(`${SIMPLE_ICONS_URL}/${getLanguageName(language)}/ffffff`),
    language,
  }));

  await Promise.all(languageFetches.map((fetch) => fetch.req));

  const data = await (await info).json();

  data.languageIcons = (
    await Promise.all(
      languageFetches.map(async (fetch) => {
        const svg = await (await fetch.req).text();
        if (svg.indexOf("<svg") !== 0) return null;
        return { language: fetch.language, svg };
      })
    )
  ).filter((x) => x !== null);

  return data;
};
