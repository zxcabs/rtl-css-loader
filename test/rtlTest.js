/*globals describe */

var test = require("./helpers").test;
var testMinimize = require("./helpers").testMinimize;

describe("rtlcss", function() {
    var _document
    before(() => {
        _document = global.document
        global.document = {
            getElementsByTagName: function() {
                return [{
                    getAttribute: function() {
                        return 'rtl'
                    }
                }];
            }
        };
    })

    after(() => {
        global.document = _document
    })

    test("basic property", ".class { right: 10px; }", [
        [1, ".class { left: 10px; }", ""]
    ]);
    test("multiple properties", ".class { border-left: 10px; padding-right: 5px; background: red; }", [
        [1, ".class { border-right: 10px; padding-left: 5px; background: red; }", ""]
    ]);
    test("ignore", ".class { /*rtl:begin:ignore*/border-right: 10px;/*rtl:end:ignore*/ left: 10px; }", [
        [1, ".class {border-right: 10px; right: 10px; }", ""]
    ])
});
