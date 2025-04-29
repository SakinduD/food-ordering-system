FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build TypeScript files
RUN npm run build || (echo "Build failed. Creating the build script..." && \
    npm pkg set scripts.build="tsc" && \
    npm run build)

EXPOSE 5007

CMD ["node", "dist/server.js"]