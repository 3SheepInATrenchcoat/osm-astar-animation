export class DeltaTimeSpliterator<T> {
    private animationData: Map<number, T>;
    private sortedKeys: number[];
    private currentIndex: number;

    constructor(animationData: Map<number, T>) {
        this.animationData = animationData;
        this.sortedKeys = Array.from(animationData.keys()).sort((a, b) => a - b);
        this.currentIndex = 0;  // To track where we are in the iteration
    }

    // This method returns the data within the next timeDelta window
    next(timeDelta: number, lastFrameTime: number): { timestamp: number, data: T }[] {
        const results: { timestamp: number, data: T }[] = [];

        // Continue processing while there are keys and they're within the delta
        while (
            this.currentIndex < this.sortedKeys.length &&
            this.sortedKeys[this.currentIndex] <= lastFrameTime + timeDelta
            ) {
            const timestamp = this.sortedKeys[this.currentIndex];
            results.push({ timestamp, data: this.animationData.get(timestamp)! });
            this.currentIndex++;
        }

        return results;
    }

    // Check if we have more data
    hasNext(): boolean {
        return this.currentIndex < this.sortedKeys.length;
    }
}