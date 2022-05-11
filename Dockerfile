FROM node:16

# https://github.com/openscad/docker-openscad/blob/main/openscad/stretch/Dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
	ca-certificates \
	git \
	make \
	openscad \
    xvfb xauth \
    && rm -rf /var/lib/apt/lists/*
RUN mkdir -p /root/.local/share /.local/share

ENV DISPLAY :99
ENV NODE_ENV production
#USER node
RUN mkdir /home/node/code
WORKDIR /home/node/code

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3014
CMD ["npm", "start"]
