import {Storage} from "../storage";
import {Action} from "./action";

export class History {
    private static past: Action[] = [];
    private static future: Action[] = [];

    static reset() {
        this.past = [];
        this.future = [];
    }

    static undo(): void {
        const action = this.past.pop();
        if (action) {
            const reverse = action.reverse();
            reverse.execute();
            this.future.push(reverse);
            Storage.store_deck();
        }
    }

    static redo(): void {
        const action = this.future.pop();
        if (action) {
            const reverse = action.reverse();
            reverse.execute();
            this.past.push(reverse);
            Storage.store_deck();
        }
    }

    static shift(backwards: boolean = false) {
        if (backwards) {
            this.redo();
        } else {
            this.undo();
        }
    }

    static record(action: Action) {
        this.past.push(action);
        this.future = [];
        Storage.store_deck();
    }
}

window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement) return
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'y':
                History.shift(!event.shiftKey);
                event.preventDefault();
                break;
            case 'z':
                History.shift(event.shiftKey);
                event.preventDefault();
                break;
        }
    }
});
