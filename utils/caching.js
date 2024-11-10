class Node {
  constructor(key, value, next = null, prev = null) {
    this.key = key;
    this.value = value;
    this.next = next;
    this.prev = prev;
  }
}

class LRU {
  //set default limit of 10 if limit is not passed.
  constructor(limit = 10) {
    this.size = 0;
    this.limit = limit;
    this.head = null;
    this.tail = null;
    this.cacheMap = {};
  }

  write(key, value) {
    const existingNode = this.cacheMap[key];
    let removedKey = null
    if (existingNode) {
      this.detach(existingNode);
      this.size--;
    } else if (this.size === this.limit) {
      delete this.cacheMap[this.tail.key];
      removedKey = this.tail.key
      this.detach(this.tail);
      this.size--;
    }

    // Write to head of LinkedList
    if (!this.head) {
      this.head = this.tail = new Node(key, value);
    } else {
      const node = new Node(key, value, this.head);
      this.head.prev = node;
      this.head = node;
    }

    // update cacheMap with LinkedList key and Node reference
    this.cacheMap[key] = this.head;
    this.size++;
    return removedKey;
  }

  read(key) {
    logger.debug(`Key: ${key} is getting read`)
    const existingNode = this.cacheMap[key];
    if (existingNode) {
      const value = existingNode.value;
      // Make the node as new Head of LinkedList if not already
      if (this.head !== existingNode) {
        // write will automatically remove the node from it's position and make it a new head i.e most used
        this.write(key, value);
      }
      return value;
    }

    logger.debug(`Item was not available in cache for key ${key}, but written the key`);
    return null 
  }

  detach(node) {
    if (node.prev !== null) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next !== null) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  removeKey(key) {
    const existingNode = this.cacheMap[key]
    if (!existingNode) {
      logger.debug(`key: ${key} not present in cache to remove. OR is already removed`)
      return;
    }
    this.detach(existingNode)
  }

  clear() {
    this.head = null;
    this.tail = null;
    this.size = 0;
    this.cacheMap = {};
  }

  length() {
    return Object.keys(this.cacheMap).length
  }

  // Invokes the callback function with every node of the chain and the index of the node.
  forEach(fn) {
    let node = this.head;
    let counter = 0;
    while (node) {
      fn(node, counter);
      node = node.next;
      counter++;
    }
  }

  // To iterate over LRU with a 'for...of' loop
  *[Symbol.iterator]() {
    let node = this.head;
    while (node) {
      yield node;
      node = node.next;
    }
  }
}
