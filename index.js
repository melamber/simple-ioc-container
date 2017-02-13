const Injector = require("./Injector");

module.exports = new Proxy(Injector, {
    construct(target, args) {
        return new target(new Map(), ...args);
    },
});
