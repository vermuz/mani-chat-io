var express = require('express'),
app = express(),
server = require('http').createServer(app),
io = require('socket.io').listen(server);
var host = process.env.VCAP_APP_HOST || 'localhost';
var port = process.env.VCAP_APP_PORT || 3000;

usernames = [];

server.listen(port);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html'); 
});

// Server Side
io.sockets.on('connection', function(socket) {
	socket.on('new user', function(data, callback){
        // Check to see if username is already taken
        if(usernames.indexOf(data) != -1){
        	callback(false);
        } else {
        	callback(true);
        	socket.username = data;
        	usernames.push(socket.username);
        	updateUsernames();
        }
	});
	// Update usernames
	function updateUsernames() {
		io.sockets.emit('usernames', usernames);
	}
	// Send Message Event
	socket.on('send message', function(data){
		// Username and data
        io.sockets.emit('new message', {msg: data, user: socket.username}); 
	});
	// If a person leaves, we don't want their username to stay
	socket.on('disconnect', function(data){
         if(!socket.username) return;
         usernames.splice(usernames.indexOf(socket.username), 1);
         updateUsernames();
	});
});
