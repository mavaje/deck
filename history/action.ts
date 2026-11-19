import {History} from "./history";

export abstract class Action {

    abstract message(): string;
    abstract execute(): void;
    abstract reverse(): Action;

    is_noop(): boolean {
        return false;
    }

    do(): void {
        if (!this.is_noop()) {
            console.log(this.message());
            this.execute();
            History.record(this);
        }
    }

    static do<
        T extends Action,
        A extends any[],
    >(
        this: new (...args: A) => T,
        ...parameters: A
    ) {
        new this(...parameters).do();
    }
}
