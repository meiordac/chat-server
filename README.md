# chat-server
Chat server using Node, Express, Typescript, Socket.io, gulp, and Heroku.

# Socket.io

Used Socket.io, a realtime abstraction library which helps my app serve users without WebSocket support. Socket.io also provides common functionality like rooms, namespaces, and automatic reconnection. 

Socket.io is one of the fastest and most reliable realtime engines.

## Development server

Run `npm run start` for a dev server. The server will serve in `http://localhost:3000/` and would be listening for new web socket requests. 

## Build

Run `gulp build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Deploy

It is ready for deployment with a Procfile and an .env file should be added, for more info on how to deploy in Heroku review https://devcenter.heroku.com/articles/deploying-nodejs where the mention all the steps.

