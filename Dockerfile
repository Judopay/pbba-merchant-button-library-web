FROM node:12.7.0 AS build

COPY . /build
WORKDIR /build

RUN npm install

RUN npm run build

FROM node:12.7.0-alpine

# Install a web server
RUN npm install serve -g

COPY --from=build /build/build /app

WORKDIR /app

CMD serve -s /app
