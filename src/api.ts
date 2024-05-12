import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { Image, createCanvas } from "canvas";

import { fetchRepoInfo, refreshToken } from "./github/client";
import { getLines } from "./util/canvas";
import { fetchLanguageIcons } from "./simple-icons/client";

let starIcon: string;

const starFormatter = Intl.NumberFormat("en", { notation: "compact" });

const app = fastify({
  logger: true,
  disableRequestLogging: true,
});

interface IContext {
  startTime: number;
}

app.setErrorHandler((error, _, reply) => {
  app.log.error(error);
  reply.status(500).send({ error: "Internal Server Error" });
});

app.addHook<any, IContext>("onRequest", (req, _, done) => {
  req.context.config.startTime = Date.now();
  done();
});

app.addHook<any, IContext>("onResponse", (request, reply, done) => {
  app.log.info(
    {
      method: request.method,
      url: request.url,
      headers: request.headers,
      hostname: request.hostname,
      remoteAddress: request.ip,
      remotePort: request.socket.remotePort,
      statusCode: reply.raw.statusCode,
      durationMs: Date.now() - request.context.config.startTime,
    },
    "served response"
  );
  done();
});

interface RepoGetParams {
  owner: string;
  repo: string;
}
const handler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { owner, repo } = request.params as RepoGetParams;
  app.log.info(`Fetching repo info for ${owner}/${repo}`);
  const repoData = await fetchRepoInfo(app.log, owner, repo);
  const languageIcons = await fetchLanguageIcons(repoData.langData);
  const canvas = createCanvas(814, 464);
  const ctx = canvas.getContext("2d");
  const gra = ctx.createLinearGradient(0, 0, 0, 464);
  gra.addColorStop(0, "#073A67");
  gra.addColorStop(1, "#040B29");
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = gra;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "bold 36pt 'Monaspace Neon'";
  ctx.textAlign = "left";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(repo, 20, 60, 775);

  ctx.font = "bold 24pt 'Monaspace Neon'";
  let lines = getLines(
    ctx,
    repoData.description || "This repository has no description.",
    764
  );
  if (lines.length > 8) {
    lines = lines.slice(0, 8);
    lines[7] = lines[7].slice(0, -3) + "...";
  }
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], 20, 110 + i * 40, 764);
  }
  const numLanguages = Math.min(languageIcons.length, 7);
  for (let i = 0; i < numLanguages; i++) {
    const img = await new Promise<Image>((resolve, reject) => {
      const svg: string = languageIcons[i];
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = `data:image/svg+xml;base64,${Buffer.from(
        svg.replace("<svg", '<svg width="64" height="64"')
      ).toString("base64")}`;
    });
    ctx.drawImage(img, 20 + i * 80, 380, 64, 64);
  }

  const img = await new Promise<Image>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = `data:image/svg+xml;base64,${Buffer.from(starIcon).toString(
      "base64"
    )}`;
  });

  const stargazers = starFormatter.format(
    repoData.parent?.stargazers_count || repoData.stargazers_count
  );

  ctx.font = "bold 32pt 'Monaspace Neon'";
  ctx.fillText(stargazers, 736 - stargazers.length * 24, 428, 96);
  ctx.drawImage(img, 750, 390, 48, 48);
  reply.header("Content-Type", "image/png");
  reply.header("Cache-Control", "no-cache");
  reply.send(canvas.toBuffer("image/png"));
};
app.get("/ryan-willis/:repo", async (request, reply) => {
  // @ts-ignore
  request.params.owner = "ryan-willis";
  return handler(request, reply);
});
app.get("/repo/:owner/:repo", handler);

(async () => {
  try {
    app.log.info("Fetching star icon");
    const starSVG = await fetch(
      "https://s2.svgbox.net/hero-outline.svg?color=white&ic=star"
    );

    const starSVGRaw = await starSVG.text();
    starIcon = starSVGRaw.replace("<svg", '<svg width="48" height="48"');

    await refreshToken(app.log);

    await app.listen({ port: 6069, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();
