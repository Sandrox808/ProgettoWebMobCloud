# Fase 1: BUILD
FROM node:22-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --configuration=production

# Fase 2: PRODUZIONE
FROM nginx:alpine
COPY --from=build /usr/src/app/dist/Front-app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]