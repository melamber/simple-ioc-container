# Simple IoC Container
###Dependencies: [Proxy](https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Proxy) object.
##Installation:
````
npm i simple-ioc-container --save
````
##API

###register(...dependencies)
Registers dependence(ies) in a container with specified params.
* dependencies {...Object} dependencies - Params of a dependence. Description:
  * key[required]: {string} dependence key;
  * type[required]: {enum} ["class", "value", "singleton"];
  * value[required]: {*} Any data. Module will be connected if a type is "class"
   or "singleton" and a value is set like a string;
  * args[optional]: {Array} arguments to bind to a constructor.
  * force[optional]: {bool} registers forcefully if true, otherwise doesn't. 
  Default false;
  * onRegister[optional]: {callback} Invokes if dependence is successfully 
  registered.

Returns an Injector instance (this).


###get(key)
Returns a dependence by a key.
* key {*} Key to get a dependence for.

Returns a dependence.


###new(key, [...args])
Returns a dependence after initialize it through its constructor. Note: a 
dependence has to have a constructor.
* key {*} Key to get a dependence for.
* args {...*} Arguments to bind to a constructor.

Returns a dependence.


###getConstructor(key, [value])
Returns a dependence constructor.
Note: a dependence has to have a constructor.
* key {*} Key to get a dependence for.
* value {*} Custom constructor or path to a constructor. Default is null.

Returns a dependence constructor.


###Examples

````javascript
// di.js

import Injector from "simple-ioc-container";

export default new Injector;

````

````javascript
// dependencies.js

import {
    CONTAINER_TYPE_VALUE,
    CONTAINER_TYPE_CLASS,
    CONTAINER_TYPE_SINGLETON
} from "simple-ioc-container/constants";
import di from "./di";
import config from "../etc/config";

di
    .register({
        key: "config",
        type: CONTAINER_TYPE_VALUE,
        value: config
    })
    .register({
        key: "db",
        type: "value", // might be specified without any constants
        value: require("./lib/mongoose").default,
        onRegister() {
            require(__dirname + "/models");
        }
    })
    .register({
        key: "UserService",
        type: CONTAINER_TYPE_CLASS,
        value: require(__dirname + "/../services/UserService"),
        args: ["admin"]
    });

// or if are not reciprocal dependencies
di
    .register({
        key: "config",
        type: CONTAINER_TYPE_VALUE,
        value: config
    }, {
         key: "someData",
         type: CONTAINER_TYPE_VALUE,
         value: {}
    })
    
````

````javascript
// services/UserService.js

import di from "../di";

const db = di.get("db");
const config = di.get("config");

module.exports = class UserService {
   
    constructor(role, id) {
        // role will be "admin" (from di)
    }
}

````

````javascript
// ...some.js

import di from "./di";

const adminService = di.new("UserService", "007");

````

####todo
* tests
* improving the docs
