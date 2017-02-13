const di = new (require("../../index"));
const constants = require("../../constants");


class B {
    constructor({A}, firstArg) {
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
    key: "B",
    type: constants["CONTAINER_TYPE_FACTORY"],
    value: B,
});


const varA = di.get("A", "second");
const varC = di.proxy.A;
const varB = di.get("B", "first");

console.log(varB instanceof B, varA.signature, varB.A.signature, varC == varA);
