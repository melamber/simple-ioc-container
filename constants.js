function define(name, value) {
    Object.defineProperty(exports, name, {
        value: value,
        enumerable: true
    });
}

define("CONTAINER_TYPE_VALUE", "value");
define("CONTAINER_TYPE_FACTORY", "factory");
define("CONTAINER_TYPE_SERVICE", "service");
