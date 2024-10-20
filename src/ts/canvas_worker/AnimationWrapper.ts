export function maxFpsWrapper(callback: (timestamp: number) => void, maxFps: number) {
    let lastExecute: number = 0;

    function initialCall(timestamp: number) {
        lastExecute = timestamp
        requestAnimationFrame(followUpCalls);
    }

    function followUpCalls(timestamp: number) {// Keep animating
        requestAnimationFrame(followUpCalls);

        // Figure out how much time has passed since the last animation
        const dt = timestamp - lastExecute;

        // If there is an FPS limit, abort updating the animation if we have reached the desired FPS
        if (maxFps > 0) {
            if (dt < (1000 / maxFps)) {
                return
            }
        }

        const deltaTime = timestamp - lastExecute
        lastExecute = timestamp;

        callback(deltaTime)
    }

    return initialCall
}