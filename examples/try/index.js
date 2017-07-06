const di = new (require("../../src/index"));
const constants = require("../../src/constants");


class B {
    constructor(firstArg) {
        const {A} = this._di;
        this.signature = `B(${Math.random()})`;
        this.A = A;
        this.firstArg = firstArg;
    }
}

di.register({
    key: "A",
    type: constants["CONTAINER_TYPE_SERVICE"],
    value: __dirname + "/A",
}).register({
    key: "A",
    type: constants["CONTAINER_TYPE_SERVICE"],
    value: __dirname + "/A",
}).register({
    key: "B",
    type: constants["CONTAINER_TYPE_FACTORY"],
    value: B,
});


const varA = di.get("A", "second");
const varC = di.proxy.A;
const varB = di.get("B", "first");

console.log(varB instanceof B, varA.signature, varB.A.signature, varC == varA);
