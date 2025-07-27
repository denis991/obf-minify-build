FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci && make all
CMD ["npx","http-server","build","-p","8080"]