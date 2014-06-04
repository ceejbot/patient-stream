'use strict';

var
    lab      = require('lab'),
    describe = lab.describe,
    it       = lab.it,
    before   = lab.before,
    demand   = require('must'),
    fs       = require('fs'),
    Request  = require('request'),
    stream   = require('readable-stream'),
    Patient  = require('./index'),
    util     = require('util')
    ;

//--------------------
// mock to buffer data written to it

function TestStream()
{
    stream.Writable.call(this);
    this.buffer = null;
}
util.inherits(TestStream, stream.Writable);

TestStream.prototype._write = function _write(chunk, encoding, callback)
{
    if (!this.buffer)
        this.buffer = chunk;
    else
        this.buffer = Buffer.concat(this.buffer, chunk);

    callback();
};

//--------------------

var scratch = './tmp.txt';
var kitten = 'http://placekitten.com/200/300';

describe('TeeableStream', function()
{
    it('demands a number in its constructor', function(done)
    {
        function shouldThrow() { return new Patient(); }
        shouldThrow.must.throw(/number of readers/);
        done();
    });

    it('can be constructed', function(done)
    {
        var t = new Patient(1);
        t.must.be.an.object();
        done();
    });


    it('inherits from PassThrough', function(done)
    {
        var t = new Patient(1);
        t.must.have.property('pipe');
        t.pipe.must.be.a.function();
        t.writable.must.be.true();
        t.readable.must.be.true();
        done();
    });

    it('wraps pipe()', function(done)
    {
        var t = new Patient(1);
        t.must.have.property('pipeAndCount');
        t.pipeAndCount.must.be.a.function();
        t.pipeAndCount.must.eql(t.pipe);

        done();
    });

    it('pipes data through to a single destination', function(done)
    {
        var tee = new Patient(1);
        var input = fs.createReadStream('./LICENSE');
        input.pause();
        var output = new TestStream();

        tee.on('end', function()
        {
            output.must.have.property('buffer');
            demand(output.buffer).exist();
            output.buffer.length.must.equal(745);
            done();
        });

        input.pipe(tee);
        tee.pipe(output);
    });

    it('pipes data through to two destinations', function(done)
    {
        var tee = new Patient(2);
        var input = fs.createReadStream('./LICENSE');
        input.pause();
        var out1 = new TestStream();
        var out2 = new fs.createWriteStream(scratch);

        tee.on('end', function()
        {
            fs.readFile(scratch, function(err, data)
            {
                demand(err).not.exist();
                Buffer.isBuffer(data).must.be.true();
                data.length.must.equal(745);
                out1.buffer.length.must.equal(745);
                done();
            });
        });

        tee.pipe(out1);
        input.pipe(tee);
        tee.pipe(out2);
    });

    it('pipes data through to several destinations', function(done)
    {
        var tee = new Patient(4);
        var input = Request.get(kitten);
        input.pause();

        tee.on('end', function()
        {
            fs.readFile(scratch + '2', function(err, data)
            {
                demand(err).not.exist();
                Buffer.isBuffer(data).must.be.true();
                data.length.must.equal(6602);

                fs.readFile(scratch + '4', function(err, data)
                {
                    demand(err).not.exist();
                    Buffer.isBuffer(data).must.be.true();
                    data.length.must.equal(6602);
                    done();
                });
            });
        });

        tee.pipe(fs.createWriteStream(scratch));
        tee.pipe(fs.createWriteStream(scratch + '2'));
        input.pipe(tee);
        tee.pipe(fs.createWriteStream(scratch + '3'));
        tee.pipe(fs.createWriteStream(scratch + '4'));

        done();
    });

    it('handles PassThrough streams incoming', function(done)
    {
        var tee = new Patient(1);
        var input = new stream.PassThrough();
        var output = new TestStream();

        tee.on('end', function()
        {
            output.must.have.property('buffer');
            output.buffer.toString().must.equal('this is some data');
            done();
        });

        input.end('this is some data');
        tee.pipe(output);
        input.pipe(tee);
    });

    lab.after(function(done)
    {
        fs.unlinkSync(scratch + '2');
        fs.unlinkSync(scratch + '3');
        fs.unlinkSync(scratch + '4');
        fs.unlink(scratch, done);
    });

});
