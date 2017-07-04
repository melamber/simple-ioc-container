# Simple IoC Container
##Installation:
````
npm i simple-ioc-container --save
````
It's really simple DI container with two main methods "register()" and "get()"
to manipulate dependencies. This package has one dependence and suits for
a front and back side code. Injection is implemented really simply as well (see examples). 

#API

##Properties:
* **_proxy_** - Proxy of an Injector instance for simple access to dependencies
                via properties.


##Methods:
###register(...dependencies)
Registers dependence(ies) in a container with specified params.
* dependencies {...Object} dependencies - Params of a dependence. Description:
  * _key_[required]: {string} dependence key;
  * _type_[required]: {enum} ["value", "factory", "service"];
  * _value_[required]: {*} Any data. Module will be connected if a type is 
  "factory" or "service" and a value is set like a string;
  * _force_[optional]: {bool} registers forcefully if true, otherwise doesn't. 
  Default false;
  * _onRegister_[optional]: {callback} Invokes if a dependence is successfully 
  registered.

Returns an Injector instance(this).


###get(key, [...args])
Returns a dependence by a key.
* key {*} Key to get a dependence for.
* args {...*} Arguments to bind to a constructor..

Returns a dependence.


###getConstructor(key)
Returns a dependence constructor.
* key {*} Key to get a dependence for.

Returns a dependence constructor.
>Note: a dependence has to have a constructor.



##Examples

````javascript
// di.js

import Injector from "simple-ioc-container";

export default new Injector;

````

````javascript
// dependencies.js

import {
    CONTAINER_TYPE_VALUE,
    CONTAINER_TYPE_FACTORY,
    CONTAINER_TYPE_SERVICE
} from "simple-ioc-container/src/constants";
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
            require(__dirname + "/schemas");
        }
    })
    .register({
        key: "userService",
        type: CONTAINER_TYPE_SERVICE,
        value: require(__dirname + "/../services/UserService"),
    });

// or if are not reciprocal dependencies
di.register({
    key: "config",
    type: CONTAINER_TYPE_VALUE,
    value: config,
    force: true
}, {
     key: "User",
     type: CONTAINER_TYPE_FACTORY,
     value: "/../models/User"
})
    
````

````javascript
// models/User.js

module.exports = class User {
   
    constructor({userService, config, db}, id) {
        this.userService = userService;
        // id => 007 in this example
        // userService, config and db are registered dependencies from di
    }
    
}

````

````javascript
// ...some.js

import di from "./di";

const serviceA = di.get("userService", "something");
const admin = di.get("User", "007");
const serviceB = di.proxy.userService;

di.register({
    key: "userService",
    type: "service",
    value: require(__dirname + "/../services/UserService"),
    force: true
});

const serviceC = di.proxy.userService;

/*
    admin instanceof User => true
    admin.userService == serviceA  => true
    serviceA == serviceB => true
    serviceA == serviceC => false
*/

````

####todo
* tests
* improving the docs
