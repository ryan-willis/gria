# gria - github repository image api

API for fetching public repo summary images for use in GitHub profile READMEs.

## Usage

To fetch an image from a github repository, simply use the following URL format:

```
https://gria.smug.af/{username}/{repository}
```

Some examples of a few repositories

<div align="center">
  <a href="https://github.com/ryan-willis/icon-workshop"><img src="https://gria.smug.af/ryan-willis/icon-workshop" width="412px" /></a>
  <a href="https://github.com/ryan-willis/netivity"><img src="https://gria.smug.af/ryan-willis/netivity" width="412px"/></a>
</div>

## Development

This project depends on `node-canvas`. If you run into issues with an `npm install`, follow the instructions in their repository: https://github.com/Automattic/node-canvas

To run the server locally:

```bash
npm start
```

And visit http://localhost:6069/ryan-willis/gria to see the image for this repository.