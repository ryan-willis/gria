import { createSign } from "crypto";

const TEN_MINUTES = 600000;

function toBase64(obj: any) {
  const str = JSON.stringify(obj);
  return Buffer.from(str).toString("base64");
}

function replaceSpecialChars(b64string: string) {
  // create a regex to match any of the characters =,+ or / and replace them with their // substitutes
  return b64string.replace(/[=+/]/g, (charToBeReplaced: string) => {
    switch (charToBeReplaced) {
      case "=":
        return "";
      case "+":
        return "-";
      case "/":
        return "_";
      default:
        return charToBeReplaced;
    }
  });
}

function getSignedToken() {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const b64Header = replaceSpecialChars(toBase64(header));

  const payload = {
    iat: Math.round((new Date().getTime() - 60) / 1000),
    iss: process.env.GITHUB_APP_CLIENT_ID,
    exp: Math.round((new Date().getTime() + TEN_MINUTES - 120) / 1000),
    alg: "RS256",
  };
  const b64Payload = replaceSpecialChars(toBase64(payload));

  const signer = createSign("RSA-SHA256");
  const jwt = `${b64Header}.${b64Payload}`;
  signer.update(jwt);
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY || "";

  return `${jwt}.${replaceSpecialChars(signer.sign(privateKey, "base64"))}`;
}

export async function getAppInstallationToken() {
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
  const req = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getSignedToken()}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  const data = await req.json();
  return data.token;
}
