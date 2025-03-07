# Etapa de build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Confirma se a pasta correta foi criada
RUN ls -la /app/.output/public

# Etapa final para servir os arquivos estáticos
FROM nginx:alpine
COPY --from=build /app/.output/public /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]