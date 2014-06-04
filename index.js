var
    assert = require('assert'),
    stream = require('readable-stream'),
    util   = require('util')
    ;

var PatientStream = module.exports = function PatientStream(readers)
{
    assert(readers && toString.call(readers) === '[object Number]', 'you must pass a number of readers to expect');
    stream.PassThrough.call(this);

    this.setMaxListeners(Math.max(10, readers * 2));
    this.on('pipe', this.onPipe.bind(this));
    this.expected = readers;
    this.originalPipe = this.pipe;
    this.pipe = this.pipeAndCount;
};
util.inherits(PatientStream, stream.PassThrough);

PatientStream.prototype.input = null;
PatientStream.prototype.expected = 0;
PatientStream.prototype.teed = 0;
PatientStream.prototype.closed = 0;

PatientStream.prototype.pipeAndCount = function pipeAndCount(output)
{
    this.teed++;
    output.on('finish', this.onFinish.bind(this));
    this.originalPipe.call(this, output);
    if ((this.teed === this.expected) && this.input)
        this.input.resume();
};

PatientStream.prototype.onPipe = function onPipe(input)
{
    this.input = input;
    if (this.teed < this.expected)
        input.pause();
};

PatientStream.prototype.onFinish = function onClose()
{
    if (++this.closed === this.teed)
        this.end();
};
