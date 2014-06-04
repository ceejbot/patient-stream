# teeable-stream

A stream that can be piped to many destinations, so long as you know in advance how many you'll need.

[![Build Status](http://img.shields.io/travis/ceejbot/teeable-stream.svg?style=flat)](http://travis-ci.org/ceejbot/teeable-stream)
![Coverage](http://img.shields.io/badge/coverage-100%25-green.svg?style=flat)

## Usage

Pause your input stream (important). Construct a `Teeable` with the number of destinations you expect to add. At your leisure, bearing in mind that you've now got backpressure on your input, add all your destinations. When you've added as many as your `Teeable` expects, the input will be resumed for you. The `Teeable` will emit `end` when all its destinations have emitted `finish`.

```javascript
var fs = require('fs'),
    Request = require('request'),
    Teeable = require('teeable-stream');

var input = Request.get('http://placekitten.com/400/400');
input.pause(); // required
var out1 = new fs.createWriteStream('kitten_copy1.jpg');
var out2 = new fs.createWriteStream('kitten_copy2.jpg');

tee.on('end', function()
{
    // do something with the two lovely kitten jpgs
});

var tee = new Teeable(2);
input.pipe(tee);
tee.pipe(out1);
tee.pipe(out2);
```

## API

`TeeableStream` is a passthrough stream, so it has the same API as a duplex stream.

## License

ISC
