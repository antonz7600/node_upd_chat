/*jshint strict:false */

const { strict } = require("assert");

var dgram = require("dgram"),
  util = require("util"),
  port = 3000,
  clients = [];

function Message(type, message, connectData) {
  var self = this;

  this.type = type;

  this.message = message;

  this.connectData = connectData;

  this.connectType = function () {
    var _message = util.format(
      "New connection on %d port",
      this.connectData.port
    );
    clients.push(connectData);
    this.share(_message);
    console.log(_message);
  };

  this.disconnectType = function () {
    var _message = util.format(
      "Disconnection on %d port",
      this.connectData.port
    );
    clients.splice(clients.indexOf(this.connectData), 1);

    this.share(_message);
    console.log(_message);
  };

  this.messageType = function () {
    var _message = util.format("%d => %s", this.connectData.port, this.message);

    this.share(_message);
    console.log(_message);
  };

  this.share = function (message) {
    var _buffer = Buffer.from(message);

    clients.forEach(function (current) {
      if (current.port != self.connectData.port) {
        server.send(_buffer, 0, _buffer.length, current.port, current.address);
      }
    });
  };

  switch (type) {
    case "connect":
      this.connectType();
      break;

    case "disconnect":
      this.disconnectType();
      break;

    case "message":
      this.messageType();
      break;

    default:
      break;
  }
}

var server = dgram.createSocket("udp4", function (data, connectData) {
  data = JSON.parse(data);
  message = new Message(data.type, data.message, connectData);

  process.stdin.resume();

  process.stdin.removeAllListeners("data");
  process.stdin.on("data", function (chunk) {
    var buffer = Buffer.from(
      "Server => %s",
      chunk.toString().replace(/\n|\n/g, "")
    );
    clients.forEach(function (current) {
      server.send(buffer, 0, buffer.length, current.port, current.address);
    });
  });
});

server.bind(port, function () {
  console.log("Server started on %d port.", port);
});
