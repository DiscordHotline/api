export default class AbstractModel<T> {
    constructor(init: Partial<T>) {
        Object.assign(this, init);
    }
}
