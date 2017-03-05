import Injector from "../src";
import InjectorClass from "../src/Injector";
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

        expect(di).to.be.instanceOf(InjectorClass);
        expect(di.proxy).to.be.instanceOf(InjectorClass);
        expect(di.register).to.have.been
            .calledOnce
            .calledWithExactly(dep1, dep2);
    });

    it("register", () => {
        const di = new Injector();

        di.register({
            key: "dep1",
            type: CONTAINER_TYPE_VALUE,
            value: {a: true},
        }, {
            key: "dep2",
            type: CONTAINER_TYPE_SERVICE,
            value: class A {},
        }).register({
            key: "dep3",
            type: CONTAINER_TYPE_FACTORY,
            value: class B {
                constructor({dep1, dep2}, arg) {
                    this.dep1 = dep1;
                    this.dep2 = dep2;
                    this.arg = arg;
                };
            },
        });



        expect(di.proxy.dep1).to.be.ok;
        expect(di.proxy.dep2).to.be.ok;

    });
});
