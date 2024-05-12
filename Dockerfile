FROM node:alpine

WORKDIR /app
COPY package*.json ./

# see https://github.com/Automattic/node-canvas/issues/866
RUN apk add --update --no-cache --virtual .build-deps \
    build-base g++ cairo-dev jpeg-dev pango-dev \
	giflib-dev librsvg-dev \
    && apk add --no-cache --virtual .runtime-deps \
    cairo jpeg pango giflib tini \
    && apk add --repository http://dl-3.alpinelinux.org/alpine/edge/testing font-monaspace-neon \
    && npm install --build-from-source \
    && apk del --no-cache  \
    build-base g++ cairo-dev jpeg-dev pango-dev giflib-dev librsvg-dev \
    && npm cache clean --force \
    && rm -fr /root/.cache /root/.npm

COPY src /app/src
COPY public /app/public
RUN npm run build && rm -fr src

EXPOSE 6069

ENTRYPOINT [ "/sbin/tini", "--" ]
CMD ["node", "dist/api.cjs"]
