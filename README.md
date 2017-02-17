# IRC-Gateway

## Usage
``` JavaScript
process.env.PORT = 6667;
process.env.NODE_ENV = 'development'; // Verbose

const IRC-Gateway = require('irc-gateway');
const ig = new IRC-Gateway({name: 'hoge-fuga-piyo'});

ig.on('connect', () => {
  ig.join(['#foo']);
  ig.topic('#foo', 'bar');
  ig.mode('#foo', '+o', true); // User Modes
  ig.mode('#foo', '+mt'); // Channel Modes
  ig.notice('#foo', 'baz');
  ig.privmsg('#foo', 'qux', 'Alice');
});

ig.on('privmsg', (text) => {});
ig.on('action', (action) => {});
```
