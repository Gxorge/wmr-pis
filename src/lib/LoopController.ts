type ActionFn = () => Promise<void>;

export class LoopController {
    private running = false;

    constructor(private readonly actionFn: ActionFn) {}

    start() {
        if (this.running) return;
        this.running = true;
        this.runLoop();
    }

    stop() {
        this.running = false;
    }
  
    isRunning() {
        return this.running;
    }

    private async runLoop() {
        while (this.running) {
            await this.actionFn(); // Run the action and wait for it to complete
        }
    }
}