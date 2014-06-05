# patient-stream

A stream that can be piped to many destinations over several ticks, so long as you know in advance how many destinations you'll need. Why? Because sometimes it's a drag to wrap everything in Passthrough streams in the same tick.

[![Build Status](http://img.shields.io/travis/ceejbot/patient-stream.svg?style=flat)](http://travis-ci.org/ceejbot/patient-stream)
![Coverage](http://img.shields.io/badge/coverage-100%25-green.svg?style=flat)

## Usage

Pause your input stream (important). Construct a `Patient` with the number of destinations you expect to add. At your leisure, bearing in mind that you've now got backpressure on your input, add all your destinations. When you've added as many as your `Patient` expects, the input will be resumed for you. The `Patient` will emit `end` when all its destinations have emitted `finish`.

```javascript
var fs = require('fs'),
    Request = require('request'),
    Patient = require('patient-stream');

var input = Request.get('http://placekitten.com/400/400');
input.pause(); // required
var out1 = new fs.createWriteStream('kitten_copy1.jpg');
var out2 = new fs.createWriteStream('kitten_copy2.jpg');

tee.on('end', function()
{
    // do something with the two lovely kitten jpgs
});

var tee = new Patient(2);
input.pipe(tee);
tee.pipe(out1);

setTimeout(function()
{
    tee.pipe(out2);
}, 1000);
```

## API

`PatientStream` is a passthrough stream, so it has the same API as a duplex stream.

## License

ISC
