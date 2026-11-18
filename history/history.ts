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
        }
        Storage.store_deck();
        console.log(this.past);
    }

    static redo(): void {
        const action = this.future.pop();
        if (action) {
            const reverse = action.reverse();
            reverse.execute();
            this.past.push(reverse);
        }
        Storage.store_deck();
        console.log(this.past);
    }

    static record(action: Action) {
        this.past.push(action);
        this.future = [];
        Storage.store_deck();
        console.log(this.past);
    }
}

window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement) return
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'y':
                if (event.shiftKey) {
                    History.undo();
                } else {
                    History.redo();
                }
                event.preventDefault();
                break;
            case 'z':
                if (event.shiftKey) {
                    History.redo();
                } else {
                    History.undo();
                }
                event.preventDefault();
                break;
        }
    }
});
