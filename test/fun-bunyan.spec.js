"use strict";
const expect = require('chai').expect;
const sinon = require('sinon');
const FunBunyan = require('../');

describe('FunBunyan', function () {
    let funBunyan;

    beforeEach(function () {
        funBunyan = new FunBunyan();
    });

    it('default level, and changing levels', function (done) {
        expect(funBunyan.trace()).to.equal(false);
        expect(funBunyan.info()).to.equal(true);
        funBunyan.level('trace');
        expect(funBunyan.trace()).to.equal(true);
        expect(funBunyan.info()).to.equal(true);

        done();
    });


    describe('FunBunyan, stringify simple, no colors', function () {
        let funBunyan;
        let stdout;
        let stddir;
        let stderr; 

        beforeEach(function () {
            stdout = sinon.spy();
            stddir = sinon.spy();
            stderr = sinon.spy(); 
    
            const options = {
                level: 'trace',
                console: {
                    logTemplate: '{%s}*(%s)*%s',
                    errorTemplate: '{%s}#(%s)#%s\n%s',
                    stdout,
                    stddir,
                    stderr, 
                    stringify: 'simple',
                    colors: false
                }
            };
            funBunyan = new FunBunyan(options);
        });

        it('can be started at a different level', function (done) {
            expect(funBunyan.trace()).to.equal(true);
            expect(funBunyan.debug()).to.equal(true);
            expect(funBunyan.info()).to.equal(true);
            expect(funBunyan.warn()).to.equal(true);
            expect(funBunyan.error()).to.equal(true);
            expect(funBunyan.fatal()).to.equal(true);
            done();
        });

        it('can use a custom LogTemplate', function (done) {
            funBunyan.trace("hello world");
            expect(stdout.calledOnce).to.equal(true);
            let output = stdout.firstCall.args[0];
            // output = output.replace(new RegExp("[0-9]", "g"), "0");
            output = output.replace(/\{.*?\}/, "{date-removed}")
            expect(output).to.equal("{date-removed}*(TRACE)*hello world");

            funBunyan.trace(new Error('test-error'), "greetings");
            expect(stderr.calledOnce).to.equal(true);
            let errOutput = stderr.firstCall.args[0] + "<<end>>";
            errOutput = errOutput.replace(/\{.*?\}/, "{date-removed}");
            errOutput = errOutput.replace(/\n    at [\s\S]*?<<end>>/, "{stack-removed}");
            expect(errOutput).to.equal("{date-removed}#(TRACE)#greetings\nError: test-error{stack-removed}");

            done();
        });

        it('can log an Object with a message', function (done) {
            funBunyan.trace({foo: 'bar'}, "this is my Object");
            expect(stdout.calledTwice).to.equal(true); // Once for the message, once for the Object.
            let output = stdout.firstCall.args[0];
            output = output.replace(/\{.*?\}/, "{date-removed}");
            expect(output).to.equal("{date-removed}*(TRACE)*this is my Object");

            const objOutput = stdout.secondCall.args[0];
            expect(objOutput).to.equal("{ foo: 'bar' }");

            done();
        });

    });    

    describe('FunBunyan, with defaults and custom colors', function () {
        let funBunyan;
        let stdout;
        let stddir;
        let stderr; 

        beforeEach(function () {
            stdout = sinon.spy();
            stddir = sinon.spy();
            stderr = sinon.spy(); 
    
            const options = {
                console: {
                    stdout,
                    stddir,
                    stderr, 
                    colors: {
                        "reset": "COLORS.Reset",
                        "bold": "COLORS.Bold",
                        "time": "COLORS.Blue",
                        "fatal": "COLORS.Magenta",
                        "error": "COLORS.Red",
                        "warn": "COLORS.Yellow",
                        "info": "COLORS.Cyan",
                        "debug": "COLORS.White",
                        "trace": "COLORS.Gray"
                    }
                }
            };
            funBunyan = new FunBunyan(options);
        });
    
        it('can be started at a different level', function (done) {
            expect(funBunyan.trace()).to.equal(false);
            expect(funBunyan.debug()).to.equal(false);
            expect(funBunyan.info()).to.equal(true);
            expect(funBunyan.warn()).to.equal(true);
            expect(funBunyan.error()).to.equal(true);
            expect(funBunyan.fatal()).to.equal(true);
            done();
        });

        it('doesn\'t log anything if level is disabled', function (done) {
            funBunyan.trace("hello world");
            expect(stdout.called).to.equal(false);
            done();
        });

        it('can use the LogTemplates', function (done) {
            funBunyan.info("hello world");
            expect(stdout.calledOnce).to.equal(true);
            let output = stdout.firstCall.args[0];
            // output = output.replace(new RegExp("[0-9]", "g"), "0");
            output = output.replace(/\[COLORS.Blue.*?COLORS.Reset\]/, "{date-removed}")
            expect(output).to.equal("{date-removed} [COLORS.BoldCOLORS.CyanINFOCOLORS.Reset]	hello world");

            funBunyan.info(new Error('dummy-error'), "salutations");
            expect(stderr.calledOnce).to.equal(true);
            let errOutput = stderr.firstCall.args[0] + "<<end>>";
            errOutput = errOutput.replace(/\[COLORS.Blue.*?COLORS.Reset\]/, "{date-removed}")

            errOutput = errOutput.replace(/\n    at [\s\S]*?<<end>>/, "{stack-removed}");
            expect(errOutput).to.equal("{date-removed} [COLORS.BoldCOLORS.CyanINFOCOLORS.Reset]	salutations\nError: dummy-error{stack-removed}");

            done();
        });

    });    

});