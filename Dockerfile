FROM nginx:alpine
COPY dist.html /usr/share/nginx/html
COPY dist /usr/share/nginx/html/dist