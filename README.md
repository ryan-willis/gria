# gria - github repository image api

API for fetching public repo summary images for use in GitHub profile READMEs.

## Usage

To fetch an image for a public GitHub repository, in your README.md, use this markdown:

```markdown
![{username}/{repository}](https://gria.smug.af/repo/{username}/{repository})
```
Here's what that looks like for this repository:
![ryan-willis/vlang](https://gria.smug.af/repo/ryan-willis/gria)

Some examples of other repositories:

<div align="center">
  <a href="https://github.com/ryan-willis/icon-workshop"><img src="https://gria.smug.af/repo/ryan-willis/icon-workshop" width="49%" /></a>
  <a href="https://github.com/ryan-willis/netivity"><img src="https://gria.smug.af/repo/ryan-willis/netivity" width="49%"/></a>
</div>

This project's dependencies:

<div align="center">
  <a href="https://github.com/automattic/node-canvas"><img src="https://gria.smug.af/repo/automattic/node-canvas" width="49%" /></a>
  <a href="https://github.com/fastify/fastify"><img src="https://gria.smug.af/repo/fastify/fastify" width="49%"/></a>
</div>

## Development

This project depends on `node-canvas`. If you run into issues with an `npm install`, follow the instructions in their repository: https://github.com/Automattic/node-canvas

To run the server locally:

```bash
npm start
```

And visit http://localhost:6069/repo/ryan-willis/gria to see the image for this repository.