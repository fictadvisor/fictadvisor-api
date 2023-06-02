###################
# BUILD FOR PRODUCTION
###################

FROM node:18-alpine3.16 as build

WORKDIR /app

COPY . .

RUN yarn install

RUN yarn build

###################
# PRODUCTION
###################

FROM node:18-alpine3.16 as production

RUN yarn install --prod

COPY --from=build /app/dist ./dist

CMD [ "node", "dist/main.js" ]

