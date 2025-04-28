
FROM node:20-alpine


WORKDIR /app


COPY package*.json ./

# Install dependencies
RUN npm install


COPY . .


EXPOSE 5005


CMD ["npm", "start"]