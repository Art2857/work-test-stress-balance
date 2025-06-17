FROM node:18-alpine

RUN apk --no-cache add curl

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

CMD ["npm", "run", "dev"] 