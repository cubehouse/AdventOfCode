
/**
 * Cyclical double linked list
 * Can move the head element forward and back
 * Can insert elements at the head of tail of the list
 * Suppots array-style access and length property
 */
export class DoubleLinkedList {
    constructor() {
        this.head = null;
        this.length = 0;

        // return a proxy object so we can perform array style operations
        return new Proxy(this, {
            get: (target, prop) => {
                const propNumber = Number(prop);
                if (!isNaN(propNumber)) {
                    const indexToFind = (propNumber + this.length) % this.length;
                    let x = target.head, idx = 0;
                    for (; idx < indexToFind; x = x.next, idx++) { }
                    return x.body;
                }
                return target[prop];
            },
        });
    }

    /**
     * Add object as head of the list
     * @param {*} obj 
     */
    unshift(obj) {
        const newObj = {
            body: obj,
        };
        if (this.head === null) {
            newObj.next = newObj;
            newObj.prev = newObj;
        } else {
            newObj.next = this.head;
            newObj.prev = this.head.prev;
        }

        this.head = newObj;
        this.head.next.prev = newObj;
        this.head.prev.next = newObj;

        this.length++;

        return newObj;
    }

    /**
     * Add object to tail of list
     * @param {*} obj 
     */
    push(obj) {
        const newObj = {
            body: obj,
        };

        if (this.head === null) {
            newObj.next = newObj;
            newObj.prev = newObj;
            this.head = newObj;
        } else {
            newObj.next = this.head;
            newObj.prev = this.head.prev;
        }

        this.head.prev.next = newObj;
        this.head.prev = newObj;

        this.length++;

        return newObj;
    }

    /**
     * Remove element from head of list (and return it)
     */
    shift() {
        const oldObj = this.head;

        oldObj.prev.next = oldObj.next;
        oldObj.next.prev = oldObj.prev;

        this.length--;

        return oldObj.body;
    }

    /**
     * Remove element from tail of list (and return it)
     */
    pop() {
        // rotate ourselves backwards and call shift()
        this.head = this.head.prev;
        const oldObj = this.shift();
        this.head = this.head.next;
        return oldObj;
    }

    moveHead(num) {
        if (num < 0) return this.moveHeadBackward(-num);

        for (let i = 0; i < num; i++) {
            this.head = this.head.next;
        }
    }

    moveHeadBackward(num) {
        for (let i = 0; i < num; i++) {
            this.head = this.head.prev;
        }
    }

    forEach(cb) {
        for (let x = this.head, idx = 0; x != this.head || idx === 0; x = x.next, idx++) {
            cb(x.body, x, idx);
        }
    }
};

export default DoubleLinkedList;
