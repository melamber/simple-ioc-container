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

const sandboxOfRegister = sinon.sandbox.create();


describe("Class Injector", () => {
    describe("Initialization", () => {
        it("constructor()", () => {
            sandboxOfRegister.spy(Injector.prototype, "register");

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

            sandboxOfRegister.restore();
        });
    });

    describe("API and inner methods", () => {
        let di, sampleObj, onRegister;

        before(() => {
            di = new Injector();
            sampleObj = {a: true};
            onRegister = sinon.spy();

            di.register({
                key: "dep1",
                type: CONTAINER_TYPE_VALUE,
                value: true,
            }, {
                key: "dep1",
                type: CONTAINER_TYPE_VALUE,
                value: sampleObj,
                force: true,
            }, {
                key: "dep1",
                type: CONTAINER_TYPE_VALUE,
                value: true,
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
        });

        describe("register()", () => {
            it("should throw an exception", () => {
                sandboxOfRegister.spy(di, "register");

                try {
                    di.register({
                        type: CONTAINER_TYPE_VALUE,
                        value: true,
                    });
                } catch (e) {}
                try {
                    di.register({
                        key: "dep1",
                        value: true,
                    });
                } catch (e) {}
                try {
                    di.register({
                        key: "dep1",
                        type: CONTAINER_TYPE_VALUE,
                    });
                } catch (e) {}

                assert(di.register.alwaysThrew("Error"));
            });

            it("should save dependencies into container", () => {
                assert(onRegister.calledOnce);
                expect(di.__container.size).equal(4);
                expect(di.__container.get("dep1")).deep.equal({
                    key: "dep1",
                    type: CONTAINER_TYPE_VALUE,
                    value: sampleObj,
                    force: true,
                });
                expect(di.__container.get("dep2")).deep.equal({
                    key: "dep2",
                    type: CONTAINER_TYPE_SERVICE,
                    value: require("./src/A"),
                    onRegister,
                });
                expect(di.__container.get("dep3")).deep.equal({
                    key: "dep3",
                    type: CONTAINER_TYPE_FACTORY,
                    value: require("./src/B"),
                });
            });
        });

        describe("__resolve()", () => {
            it("should return a correct dependence by a key", () => {
                expect(di.__resolve(
                    di.__container.get("dep1"), [], true)
                ).equal(sampleObj);
                expect(di.__resolve(
                    di.__container.get("dep1"), ['a', 'b'], false)
                ).equal(sampleObj);
                expect(di.__resolve(
                    di.__container.get("dep2"), ['a', 'b'], true
                )).equal(require("./src/A"));
                expect(di.__resolve(
                    di.__container.get("dep2"), ['a', 'b'], false
                )).instanceOf(ConstructorA);
                expect(di.__resolve(
                    di.__container.get("dep3"), ['a', 'b'], true
                )).equal(ConstructorB);
                expect(di.__resolve(
                    di.__container.get("dep3"), ['a', 'b'], false
                )).instanceOf(ConstructorB);
                expect(di.__resolve(
                    di.__container.get("dep4"), ['a', 'b'], true
                )).equal(ConstructorA);
                expect(di.__resolve(
                    di.__container.get("dep4"), ['a', 'b'], false
                )).equal(ConstructorA);
            });

            it("lazy loading for service type", () => {
                /*const dep1 = di.proxy.dep1;

                 expect(dep1)
                 .equal(sampleObj)
                 .equal(di.get("dep1"))
                 .deep.equal({a: true});
                 expect(di.proxy.dep2)
                 .instanceOf(ConstructorA)
                 .equal(di.get("dep2"))
                 .deep.equal(new ConstructorA);*/
            });
        });


    });
});
