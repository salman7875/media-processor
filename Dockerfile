FROM ubuntu:latest

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    software-properties-common \
    ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs ffmpeg \
    && add-apt-repository -y ppa:tomtomtom/yt-dlp \
    && apt-get update \
    && apt-get install -y yt-dlp \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /home/app

RUN npm i -g nodemon

CMD ["nodemon", "src/server.js"]