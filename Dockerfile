FROM node:22-alpine

WORKDIR /usr/src/app
COPY index.html landing.html admin.html admin-login.html styles.css landing.css admin.css admin-login.css app.js landing.js admin.js admin-login.js server.js package.json ./
COPY assets ./assets
RUN mkdir -p data uploads

EXPOSE 80
CMD ["node", "server.js"]
