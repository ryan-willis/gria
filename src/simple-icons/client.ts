import * as si from "simple-icons";

// const SIMPLE_ICONS_URL = "https://cdn.simpleicons.org";

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

export async function getLanguageIcons(
  langData: Record<string, number>
): Promise<string[]> {
  const languages = Object.keys(langData);
  const siLookup = si as unknown as Record<string, Record<string, string>>;
  return languages
    .map((language) => {
      let name = getLanguageIconName(language);
      name = name[0].toUpperCase() + name.slice(1);
      const icon = siLookup[`si${name}`];
      if (icon === undefined) return null;
      return icon.svg.replace("<svg", '<svg fill="#ffffff"');
    })
    .filter(isNotNull);
}

// export async function fetchLanguageIcons(
//   langData: Record<string, number>
// ): Promise<string[]> {
//   return getLanguageIcons(langData);
//   const languages = Object.keys(langData);
//   const languagePromises = languages.map(
//     (language) =>
//       new Promise<string | null>(async (resolve) => {
//         const url = `${SIMPLE_ICONS_URL}/${getLanguageIconName(
//           language
//         )}/ffffff`;
//         const req = await fetch(url);
//         const svg = await req.text();
//         if (svg.indexOf("<svg") !== 0) resolve(null);
//         resolve(svg);
//       })
//   );
//   const svgs = await Promise.all(languagePromises);
//   return svgs.filter(isNotNull);
// }
