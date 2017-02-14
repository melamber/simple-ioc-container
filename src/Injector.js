const constants = require("./constants");
const checkableTypes = {
    [constants["CONTAINER_TYPE_VALUE"]]: true,
    [constants["CONTAINER_TYPE_FACTORY"]]: true,
    [constants["CONTAINER_TYPE_SERVICE"]]: true,
};

/**
 * Creates a new Injector.
 * @class
 */
module.exports = class Injector {

    /**
     * Initializes the Injector with a container.
     * @constructs
     *
     * @param {Map|Object} container - Container for dependencies.
     * @param {...Object} dependencies - See {@link Injector#register}.
     *                                  (optional)
     */
    constructor(container, ...dependencies) {
        /**
         * @protected
         * @property {object} __container - contains a container of
         *                                  dependencies.
         */
        Object.defineProperty(this, "__container", {
            value: container,
            __proto__: null
        });

        this.__setProxy();

        if (dependencies.length > 0) {
            this.register(dependencies);
        }
    }

    /**
     * Sets proxy.
     * @protected
     */
    __setProxy() {
        this.proxy = new Proxy(this, {
            get(target, prop) {
                return target.get(prop);
            }
        });
    }

    /**
     * Registers dependence(ies) in a container with specified params.
     *
     * @param {...Object} dependencies - Params of a dependence. Description:
     *     {
     *         key(required): {string} dependence key;
     *         type(required): {enum} ["class", "value", "singleton"];
     *         value(required): {*};
     *         args(optional): {Array} arguments to bind to a constructor.
     *         force(optional): {bool} registers forcefully if true, otherwise
     *             doesn't. Default false;
     *         onRegister(optional): {callback} Invokes if dependence is
     *             successfully registered.
     *     }
     *
     * @returns {Injector} Injector instance.
     * @throws Error
     */
    register(...dependencies) {
        dependencies.forEach(params => {
            if (!params.key || params.key == null) {
                throw new Error("Key is not specified.");
            } else if (!(params.type in checkableTypes)) {
                throw new Error("Type is invalidated.");
            } else if (!("value" in params)) {
                throw new Error("Value is not specified.");
            }
            if (params.force) {
                this.__container.delete(params.key);
                this.__container.set(params.key, params);
            } else {
                if (!this.__container.has(params.key)) {
                    this.__container.set(params.key, params);
                } else {
                    return;
                }
            }
            if (params.onRegister && typeof params.onRegister == "function") {
                params.onRegister();
            }
        });

        return this;
    }

    /**
     * Resolves all dependencies before invoke one of them by a key.
     * @protected
     *
     * @param {Object} dependence - Dependence params.
     *                              See {@link Injector#register}.
     * @param {Array} args - Arguments to bind to a constructor.
     * @param {Boolean} needConstructor - Returns constructor if true
     *                                    otherwise instance. Default false.
     *
     * @returns {*} Dependence.
     */
    __resolve(dependence, args = [], needConstructor = false) {
        let Constructor;

        switch (dependence.type) {
        case constants["CONTAINER_TYPE_VALUE"]:
            return dependence.value;
        case constants["CONTAINER_TYPE_FACTORY"]:
            Constructor = this.__issueConstructor(dependence);

            return needConstructor ? Constructor : new Constructor(...args);
        case constants["CONTAINER_TYPE_SERVICE"]:
            if (typeof dependence.value == "object") {
                return needConstructor
                    ? dependence.value.constructor
                    : dependence.value;
            }

            Constructor = this.__issueConstructor(dependence);

            if (needConstructor) {
                return Constructor;
            }

            this.register({
                key: dependence.key,
                type: constants["CONTAINER_TYPE_SERVICE"],
                value: new Constructor(...args),
                force: true
            });

            return this.__container.get(dependence.key).value;
        }
    }

    /**
     * Issues a constructor for a dependence.
     * @protected
     *
     * @param {Object} dependence - Dependence params.
     *                              See {@link Injector#register}.
     * @returns {*} Constructor with bound args.
     */
    __issueConstructor(dependence) {
        const Constructor = this.getConstructor(null, dependence.value);
        const proxy = this.proxy;

        return new Proxy(Constructor, {
            construct(target, args) {
                args.unshift(proxy);

                return new target(...args);
            }
        });
    }

    /**
     * Returns a dependence by a key.
     *
     * @param {*} key - Key to get a dependence for.
     * @param {...*} args - Arguments to bind to a constructor.
     *
     * @returns {*} Dependence.
     */
    get(key, ...args) {
        try {
            return this.__resolve(this.__container.get(key), args);
        } catch (e) {
            console.error(`Undefined key ${key}`);
            console.error(e);
        }
    }

    /**
     * Returns a dependence constructor.
     * Note: a dependence has to have a constructor.
     *
     * @param {*} key - Key to get a dependence for.
     * @param {*} value - Custom constructor or path to a constructor.
     *
     * @returns {Function} Dependence constructor.
     * @throws Error
     */
    getConstructor(key, value = null) {
        try {
            let target = (value
                    ? value
                    : this.__resolve(this.__container.get(key), [], true)
                );

            if (typeof target == "function") {
                return target;
            } else if (typeof target == "string") {
                let constructor = require(target);

                if (constructor && constructor.__esModule) {
                    constructor = target.default;
                }

                if (typeof constructor == "function") {
                    return constructor;
                }
            } else if (typeof target == "object") {
                return target.constructor;
            }

            throw new Error("This is not constructor.");
        } catch (e) {
            console.error(`Undefined key ${key}`);
            console.error(e);
        }
    }

};
