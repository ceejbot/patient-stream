var
    assert = require('assert'),
    stream = require('readable-stream'),
    util   = require('util')
    ;

var TeeableStream = module.exports = function TeeableStream(readers)
{
    assert(readers && toString.call(readers) === '[object Number]', 'you must pass a number of readers to expect');
    stream.PassThrough.call(this);

    this.setMaxListeners(Math.max(10, readers * 2));
    this.on('pipe', this.onPipe.bind(this));
    this.expected = readers;
    this.originalPipe = this.pipe;
    this.pipe = this.pipeAndCount;
};
util.inherits(TeeableStream, stream.PassThrough);

TeeableStream.prototype.input = null;
TeeableStream.prototype.expected = 0;
TeeableStream.prototype.teed = 0;
TeeableStream.prototype.closed = 0;

TeeableStream.prototype.pipeAndCount = function pipeAndCount(output)
{
    this.teed++;
    output.on('finish', this.onFinish.bind(this));
    this.originalPipe.call(this, output);
    if ((this.teed === this.expected) && this.input)
        this.input.resume();
};

TeeableStream.prototype.onPipe = function onPipe(input)
{
    this.input = input;
    if (this.teed < this.expected)
        input.pause();
};

TeeableStream.prototype.onFinish = function onClose()
{
    if (++this.closed === this.teed)
        this.end();
};
