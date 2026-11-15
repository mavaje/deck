import {HTML} from "./xml";

export class Panel {
    static id: string;

    static toggle() {
        if (HTML.div({id: this.id}).classList.contains('collapsed')) {
            this.open();
        } else {
            this.close();
        }
    }

    static open(...args: any[]): void {
        HTML.div({
            id: this.id,
            class: '-collapsed',
        });
    }

    static close(): void {
        HTML.div({
            id: this.id,
            class: 'collapsed',
        });
    }
}
