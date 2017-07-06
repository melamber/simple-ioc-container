export default class B {
    constructor(arg1, arg2) {
        const {dep1, dep2} = this._di;

        this.dep1 = dep1;
        this.dep2 = dep2;
        this.arg1 = arg1;
        this.arg2 = arg2;
    };
}
