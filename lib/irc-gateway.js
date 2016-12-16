const net = require('net');
const EventEmitter = require('events').EventEmitter;

const log = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    require('util').log(args);
  }
}

class IrcGateway extends EventEmitter {
  constructor(options) {
    super();
    this.options = options || {
      name: 'IRC-Gateway'
    }

    this.server = net.createServer((connection) => {
      this.on('send', (msg) => {
        log(`>> ${msg}`);
        connection.write(`${msg}\r\n`);
      });

      let buffer = '';
      connection.on('data', (data) => {
        buffer += data;
        let lines = buffer.split('\r\n');
        buffer = lines.pop();

        for (const line of lines) {
          const [command, ...args] = line.split(' ');
          log('<< ', command, args);
          switch (command) {
            case 'NICK':
              this.nick = args[0];
              break;
            case 'USER':
              this.emit('send', `:${this.nick} 001 ${this.nick} Welcome to ${this.options.name}`);
              this.emit('connect');
              break;
            case 'PRIVMSG':
              // CTCP Action
              if (args[1] === ':\u0001ACTION') {
                const action = args.slice(2).join(' ').replace('\u0001', '');
                this.emit('action', action);
              } else {
                const text = args.slice(1).join(' ').replace(/^:/, '');
                this.emit('privmsg', text);
              }
              break;
          }
        }
      });
      connection.on('error', (error) => {
        log(error);
      });
      connection.on('close', () => {
        // connection close
      });
    }).listen(process.env.PORT || 22858);
  }

  sendRaw(msg) {
    this.emit('send', msg);
  }
  join(channel) {
    this.emit('send', `:${this.nick} JOIN ${channel.join()}`);
  }
  topic(channel, text) {
    this.emit('send', `:${this.nick} TOPIC ${channel} ${text}`);
  }
  privmsg(channel, text, nick) {
    this.emit('send', `:${nick || this.nick} PRIVMSG ${channel} ${text}`);
  }
  notice(channel, text, nick) {
    this.emit('send', `:${nick || this.nick} NOTICE ${channel} ${text}`);
  }
  mode(channel, mode, user) {
    this.emit('send', `:${this.nick} MODE ${channel} ${mode} ${user ? this.nick : ''}`);
  }
}

module.exports = IrcGateway;
