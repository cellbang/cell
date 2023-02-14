###################
# BUILD FOR PRODUCTION
###################
FROM node:18-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node . .

RUN yarn

ENV NODE_ENV production

RUN npx malagu build -m server -m prod

USER node

###################
# PRODUCTION
###################
FROM node:18-alpine As production

COPY --chown=node:node --from=build /usr/src/app/.malagu/dist /dist

WORKDIR /dist

CMD [ "node", "backend/index.js" ]
