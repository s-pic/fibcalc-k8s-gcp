FROM node:16-alpine as builder
WORKDIR '/app'
COPY ./package.json .
RUN npm i
COPY . .
CMD ["npm", "run", "build"]

# first block gets terminated by the following FROM statement
FROM nginx
EXPOSE 3000
# copy from first phase called builder. all the rest gets dumped!
COPY --from=builder /app/build /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# nginx image will start automatically