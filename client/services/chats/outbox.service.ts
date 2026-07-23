class OutboxService {

    private queue: (() => Promise<void>)[] = [];

    private processing = false;

    async enqueue(job: () => Promise<void>) {

        this.queue.push(job);

        this.process();

    }

    private async process() {

        if (this.processing)
            return;

        this.processing = true;

        while (this.queue.length) {

            const job = this.queue.shift();

            if (!job)
                continue;

            try {

                await job();

            }

            catch {

                this.queue.unshift(job);

                break;

            }

        }

        this.processing = false;

    }

}

export const outboxService =
    new OutboxService();