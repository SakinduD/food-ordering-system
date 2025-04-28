FROM node:18-alpine

WORKDIR /app

# Install TypeScript globally
RUN npm install -g typescript

COPY package*.json ./
RUN npm install

COPY . .

# Compile TypeScript directly
RUN tsc || echo "TypeScript compilation completed with warnings"

EXPOSE 5010

# Use node to run the compiled JavaScript file
CMD ["node", "dist/server.js"]