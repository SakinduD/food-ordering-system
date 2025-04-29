FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Add build and start scripts if they don't exist
RUN npm pkg set scripts.start="node dist/server.js" scripts.build="tsc"

COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Build TypeScript files
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
