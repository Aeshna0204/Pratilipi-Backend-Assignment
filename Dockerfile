FROM node:20

WORKDIR /app

#  Install deps first (cache-friendly)
COPY package*.json ./
RUN npm install

#  Copy Prisma schema & generate client
COPY prisma ./prisma
RUN npx prisma generate

#  Copy app source
COPY src ./src
COPY .env ./

EXPOSE 3000

#  Runtime: migrate + start
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]