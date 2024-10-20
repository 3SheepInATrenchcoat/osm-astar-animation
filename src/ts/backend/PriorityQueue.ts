import Heap from "heap-js";

export class PriorityQueue<T> extends Heap<{priority: number, element: T}> {

    enqueue(priority: number, element: T) {
        this.push({ priority, element });
    }

    dequeue() {
        return this.pop()?.element ?? null
    }

}