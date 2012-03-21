HTML5 Multiplayer Game
===

This is an extremely simple game multiplayer game written in [CoffeeScript](http://coffeescript.org/) / Javascript. When users join the server, an avatar displays their location. They can click on the game world to move their avatar.

You must have [node.js](http://nodejs.org/) installed to run the game server. To start the server, run the following command:

```
./run.sh
```

Then navigate to localhost:3000 in your browser to open the client. To stop the server, run:


```
./run.sh stop
```

The server runs on [node.js](http://nodejs.org/). The game uses [socket.io](http://socket.io/) for sending messages between the server and client. 