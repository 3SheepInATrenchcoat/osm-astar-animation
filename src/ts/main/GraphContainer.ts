import {SerializedGraph} from "graphology-types";
import {
    ChangeGraphEvent,
    GraphData,
    GraphEdge,
    GraphNode,
    GraphLocation,
    WorkerReturnEvent,
    WorkerGetEvent, GetGraphEvent
} from "../common";

import {filter, fromEvent, map, Observable, Subject, take} from 'rxjs';

export class GraphContainer {
    worker: Worker;

    private messageObservable$: Observable<WorkerReturnEvent>;
    private sendMessageSubject: Subject<WorkerGetEvent> = new Subject();

    graph$: Observable<SerializedGraph<GraphNode, GraphEdge, GraphData>>;



    constructor() {
        this.worker = new Worker(new URL('../canvas_worker/worker.ts', import.meta.url));
        this.messageObservable$ = fromEvent<MessageEvent<WorkerReturnEvent>>(this.worker, "message").pipe(
            map(event => event.data)
        );

        // TODO dispose
        this.sendMessageSubject.subscribe((event) => {
            this.worker.postMessage(event)
        })

        this.graph$ = this.messageObservable$.pipe(
            map(event => {
                if (event.type == "returnGraph") {
                    return event.graph
                }
            }),
            filter(data => data !== undefined)
        )


    }

    // The next() method waits for the next available graph
    next() {
        this.sendMessageSubject.next({
            type: "getGraph"
        })


        return this.graph$.pipe(take(1))
    }

    setLocation(location: GraphLocation) {
        const changeEvent: ChangeGraphEvent = {
            type: 'changeGraph',
            location: location
        };

        this.sendMessageSubject.next(changeEvent);  // Send change event to worker
    }
}