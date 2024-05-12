const SIMPLE_ICONS_URL = "https://cdn.simpleicons.org";

const LANGUAGE_RENAMES: Record<string, string> = {
  SCSS: "sass",
  HTML: "html5",
  Shell: "gnubash",
  Dockerfile: "docker",
};

function getLanguageIconName(language: string) {
  return LANGUAGE_RENAMES[language] || language.toLowerCase();
}

function isNotNull<T>(argument: T | null): argument is T {
  return argument !== null;
}

export async function fetchLanguageIcons(
  langData: Record<string, number>
): Promise<string[]> {
  const languages = Object.keys(langData);
  const languagePromises = languages.map(
    (language) =>
      new Promise<string | null>(async (resolve) => {
        const url = `${SIMPLE_ICONS_URL}/${getLanguageIconName(
          language
        )}/ffffff`;
        const req = await fetch(url);
        const svg = await req.text();
        if (svg.indexOf("<svg") !== 0) resolve(null);
        resolve(svg);
      })
  );
  const svgs = await Promise.all(languagePromises);
  return svgs.filter(isNotNull);
}
