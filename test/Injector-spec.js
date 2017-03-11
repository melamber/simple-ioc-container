import Injector from "../src";
import {assert} from "chai";
import InjectorClass from "../src/Injector";
import ConstructorA from "./src/A";
import ConstructorB from "./src/B";
import {
    CONTAINER_TYPE_VALUE,
    CONTAINER_TYPE_FACTORY,
    CONTAINER_TYPE_SERVICE,
} from "../src/constants";



describe("Class Injector", () => {

    it("constructor()", () => {
        sinon.spy(Injector.prototype, "register");

        const dep1 = {
            key: "dep1",
            type: CONTAINER_TYPE_VALUE,
            value: "dependence",
        };
        const dep2 = {
            key: "dep2",
            type: CONTAINER_TYPE_VALUE,
            value: "dependence",
        };

        const di = new Injector(dep1, dep2);

        expect(di).instanceOf(InjectorClass);
        expect(di.proxy).instanceOf(InjectorClass);
        expect(di.register)
            .calledOnce
            .calledWithExactly(dep1, dep2);
    });

    it("register()", () => {
        const di = new Injector();
        const sampleObj = {a: true};
        const onRegister = sinon.spy();

        di.register({
            key: "dep1",
            type: CONTAINER_TYPE_VALUE,
            value: sampleObj,
        }, {
            key: "dep2",
            type: CONTAINER_TYPE_SERVICE,
            value: require("./src/A"),
            onRegister,
        }).register({
            key: "dep3",
            type: CONTAINER_TYPE_FACTORY,
            value: require("./src/B"),
        }).register({
            key: "dep4",
            type: CONTAINER_TYPE_VALUE,
            value: ConstructorA,
        });

        assert(onRegister.calledOnce);

        const dep1 = di.proxy.dep1;

        expect(dep1)
            .equal(sampleObj)
            .equal(di.get("dep1"))
            .deep.equal({a: true});
        expect(di.proxy.dep2)
            .instanceOf(ConstructorA)
            .equal(di.get("dep2"))
            .deep.equal(new ConstructorA);
    });
});
