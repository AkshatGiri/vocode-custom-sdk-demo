export default class Queue {
  constructor({ onChange }) {
    this.items = [];
    this.onChange = onChange; // NOTE: This is a poor mans event listener. We can upgrade to a real EventEmitter class if we need to. This should be sufficient for our current usecase.
  }

  enqueue(element) {
    this.items.push(element);
    this.onChange(this.items.length);
  }

  dequeue() {
    if (this.isEmpty()) {
      console.warn("UNDERFLOW ERROR: Trying to dequeue an empty queue.");
      return null;
    }
    const item = this.items.shift();
    this.onChange(this.items.length);
    return item;
  }

  peek() {
    if (this.isEmpty()) {
      console.warn("UNDERFLOW ERROR: Trying to peek an empty queue.");
      return null;
    }
    return this.items[0];
  }

  isEmpty() {
    return this.items.length === 0;
  }

  clear() {
    this.items = [];
    this.onChange(this.items.length);
  }
}
