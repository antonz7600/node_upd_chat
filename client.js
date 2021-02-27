var dgram = require("dgram"),
  server = {
    host: "localhost",
    port: 3000,
  };
function ProcessMessage() {
  process.stdin.on("data", function (chunk) {
    var message = chunk.toString().split(/\r\n/g)[0];
    var object;
    if (message == "exit") {
      object = '{"type":"disconnect"}';
      console.log("Type Ctrl + C to close");
    } else {
      object = '{"type":"message", "message":"' + message + '"}';
    }

    var buffer = Buffer.from(object);
    client.send(buffer, 0, buffer.length, server.port, server.host);
  });
}

var client = dgram.createSocket("udp4", function (message, connectData) {
  console.log("%s", message.toString());
  process.stdin.resume();
});

client.bind();

client.on("listening", function () {
  var buffer = Buffer.from('{"type":"connect"}');

  console.log("User on %d port connected.", client.address().port);
  console.log('Type "exit" to disconnect');
  client.send(buffer, 0, buffer.length, server.port, server.host);
});

client.on("error", function (err) {
  console.log(err);
});

client.on("close", function () {
  var buffer = Buffer.from('{"type":"disconnect"}');

  console.log("User from %d port disconnected", client.address().port);
  client.send(buffer, 0, buffer.length, server.port, server.host);
});

process.stdin.resume();
ProcessMessage();
