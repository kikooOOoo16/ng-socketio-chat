# Stage 1 - Build Stage
FROM node:16-alpine3.15 as build-stage

# create app dir
RUN mkdir -p /app

# Set workdir to be /app
WORKDIR /app

# Copy package.json files before copy dir files to avoid unnecessary rebuild of node_modules layer
COPY ./app/package*.json /app
RUN npm install
# Copy host workdir app code to container workdir
COPY ./app /app

RUN npm run build

# Stage 2 deploy stage

# use Nginx server to serve build angular app
FROM nginx:1.21.6

# copy server config file
COPY nginx.conf /etc/nginx/nginx.conf

# copy built files from build stage into Nginx server at /usr/share/nginx/html
COPY --from=build-stage /app/dist/ng-socketio-app /usr/share/nginx/html