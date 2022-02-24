/*
In the node.js intro tutorial (http://nodejs.org/), they show a basic tcp 
server, but for some reason omit a client connecting to it.  I added an 
example at the bottom.
Save the following server in example.js:
*/

var net = require('net');

var server = net.createServer(function(socket) {
	socket.write('Echo server\r\n');
	// socket.pipe(socket);
    socket.on('data', function(chunk) {
        console.log(chunk.length);
        console.log(chunk.toString());
        console.log(chunk.toString('hex'));
        console.log(chunk.toString('utf8'));
        socket.write(chunk);
    });

    socket.on()

    socket.on('error', function(err) {
        console.log(`Error: ${err}`);
    });
});

server.listen(1337, '127.0.0.1');