import Injector from "../src";
import InjectorClass from "../src/Injector";
import {
    CONTAINER_TYPE_VALUE,
    CONTAINER_TYPE_FACTORY,
    CONTAINER_TYPE_SERVICE,
} from "../src/constants";


describe("Class Injector", () => {
    // beforeEach(() => {
    //
    // }));

    it("constructor()", () => {
        const di = new Injector({
            key: "dep",
            type: CONTAINER_TYPE_VALUE,
            value: {a: true},
        });
        console.log(di.proxy.dep);

        expect(di).to.be.instanceOf(InjectorClass);
        expect(di.proxy).to.be.instanceOf(InjectorClass);
        expect(di.proxy.dep.a).to.be.true;
    });

    it("calls the original function", () => {
        const spy = sinon.spy();
        const proxy = function(callback) {
            callback()
        };

        //console.log(sinon.spy());
        proxy(spy);
        assert(spy.called);
        //expect(spy).to.have.been.calledWith('Greeting: James');

        expect(spy).to.have.been.calledOnce;
    });

    it("__setProxy()", () => {
        const di = new Injector();

        expect(di.proxy).to.be.instanceOf(InjectorClass);
    });
});
