import {HTML} from "./xml";

export class Panel {
    static id: string;

    static element() {
        return HTML.div({id: this.id});
    }

    static toggle(...args: any[]) {
        if (this.element().classList.contains('collapsed')) {
            this.open(...args);
        } else {
            this.close(...args);
        }
    }

    static open(...args: any[]): void {
        this.element().classList.remove('collapsed');
    }

    static close(...args: any[]): void {
        this.element().classList.add('collapsed');
    }
}
