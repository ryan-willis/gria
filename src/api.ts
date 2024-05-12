import fastify from "fastify";
import { Image, createCanvas } from "canvas";

import { fetchRepoInfo } from "./github/client";
import { getLines } from "./util/canvas";

const app = fastify({
  logger: true,
  disableRequestLogging: true,
});

app.setErrorHandler((error, _, reply) => {
  app.log.error(error);
  reply.status(500).send({ error: "Internal Server Error" });
});

interface RepoGetParams {
  owner: string;
  repo: string;
}
app.get("/:owner/:repo", async (request, reply) => {
  const { owner, repo } = request.params as RepoGetParams;
  const repoData = await fetchRepoInfo(owner, repo);
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
  ctx.fillText(repo, 20, 60, 560);

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
  const numLanguageIcons = Math.min(repoData.languageIcons.length, 6);
  for (let i = 0; i < numLanguageIcons; i++) {
    const img = await new Promise<Image>((resolve, reject) => {
      const svg: string = repoData.languageIcons[i].svg;
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = `data:image/svg+xml;base64,${Buffer.from(
        svg.replace("<svg", '<svg width="64" height="64"')
      ).toString("base64")}`;
    });
    ctx.drawImage(img, 20 + i * 80, 380, 64, 64);
  }
  reply.header("Content-Type", "image/png");
  reply.send(canvas.toBuffer("image/png"));
});

(async () => {
  try {
    await app.listen({ port: 6069, host: "0.0.0.0" });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
})();
