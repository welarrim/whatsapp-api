# Dockerfile
FROM node

# update and install dependency
RUN apt update -y && apt upgrade -y
RUN apt install git libnss3-dev libgdk-pixbuf2.0-dev libgtk-3-dev libxss-dev libasound2 -y

RUN useradd -ms /bin/bash app

# create destination directory
RUN mkdir /home/app/whatsapp
WORKDIR /home/app/whatsapp

# copy the app, note .dockerignore
COPY . /home/app/whatsapp
RUN npm install

RUN chown -R app:app /home/app/whatsapp
USER app

EXPOSE 8080

CMD [ "npm", "start" ]
