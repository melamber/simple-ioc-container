const {
    CONTAINER_TYPE_VALUE,
    CONTAINER_TYPE_FACTORY,
    CONTAINER_TYPE_SERVICE
} = require("./constants");
const checkableTypes = [
    CONTAINER_TYPE_VALUE,
    CONTAINER_TYPE_FACTORY,
    CONTAINER_TYPE_SERVICE
];


/**
 * Creates a new Injector.
 * @class
 * @property {object} proxy - Proxy of an Injector instance for simple access to
 *                            dependencies via properties.
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

        this.proxy = new Proxy(this, {
            get(target, prop) {
                return target.get(prop);
            }
        });

        this.register(...dependencies);
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
            const {key, type, force, onRegister} = params;

            if (!key) {
                throw new Error("Key is not specified.");
            } else if (!checkableTypes.includes(type)) {
                throw new Error("Type is invalidated.");
            } else if (!("value" in params)) {
                throw new Error("Value is not specified.");
            }

            if (force) {
                this.__container.delete(key);
                this.__container.set(key, params);
            } else {
                if (!this.__container.has(key)) {
                    this.__container.set(key, params);
                } else {
                    return console.warn(
                        "Dependence key '" + key +
                        "' has already registered. " +
                        "You should specify flag 'force'."
                    );
                }
            }

            if (onRegister && typeof onRegister == "function") {
                onRegister();
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
        switch (dependence.type) {
        case CONTAINER_TYPE_VALUE:
            return dependence.value;
        case CONTAINER_TYPE_FACTORY:
            return needConstructor
                ? this.getConstructor(null, dependence.value)
                : new (this.__issueProxyConstructor(dependence))(...args);
        case CONTAINER_TYPE_SERVICE:
            if (typeof dependence.value == "object") {
                return needConstructor
                    ? dependence.value.constructor
                    : dependence.value;
            } else if (needConstructor) {
                return this.getConstructor(null, dependence.value);
            }

            this.register({
                key: dependence.key,
                type: CONTAINER_TYPE_SERVICE,
                value: new (this.__issueProxyConstructor(dependence))(...args),
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
    __issueProxyConstructor(dependence) {
        const Constructor = this.getConstructor(null, dependence.value);
        const proxy = this.proxy;

        return new Proxy(Constructor, {
            construct(target, args) {
                target.prototype._di = proxy;

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
            console.error(`Undefined key "${key}"`);
            console.error(e);
        }
    }

    /**
     * Returns a dependence constructor.
     * Note: a dependence has to have a constructor.
     *
     * @param {*} key - Key to get a dependence for.
     * @param {*} value - Custom constructor or path to a constructor. (inner)
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
                if (value.__esModule) {
                    return value.default;
                }

                return target.constructor;
            }

            throw new Error("This is not a constructor.");
        } catch (e) {
            console.error(`Undefined key "${key}"`);
            console.error(e);
        }
    }

};
