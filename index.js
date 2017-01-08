const Injector = require("./Injector");

module.exports = new Proxy(Injector, {
    construct(target, args) {
        return new target.prototype.constructor(new Map(), ...args);
    }
});
