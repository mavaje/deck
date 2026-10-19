export class TestCounter {
    public count = 0;
    public passes = 0;
    public fails = 0;

    add(pass: boolean): this {
        this.count++;
        if (pass) {
            this.passes++;
        } else {
            this.fails++;
        }

        return this;
    }

    accumulate(...counters: TestCounter[]) {
        counters.forEach(counter => {
            this.count += counter.count;
            this.passes += counter.passes;
            this.fails += counter.fails;
        });

        return this;
    }

    format(message: string) {
        return message
            .replaceAll('{count}', `${this.count}`)
            .replaceAll('{passes}', `${this.passes}`)
            .replaceAll('{fails}', `${this.fails}`);
    }
}
