FROM node:22-slim
WORKDIR /app
COPY package.json ./
COPY server ./server
COPY public ./public
COPY scripts ./scripts
ENV NODE_ENV=production PORT=8080 DB_PATH=/data/jjup.db
RUN mkdir -p /data && chown -R node:node /data /app
USER node
EXPOSE 8080
CMD ["node", "--disable-warning=ExperimentalWarning", "server/index.js"]
