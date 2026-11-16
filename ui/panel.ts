import {HTML} from "./xml";

export class Panel {
    static id: string;

    static toggle(...args: any[]) {
        if (HTML.div({id: this.id}).classList.contains('collapsed')) {
            this.open(...args);
        } else {
            this.close(...args);
        }
    }

    static open(...args: any[]): void {
        HTML.div({
            id: this.id,
            class: '-collapsed',
        });
    }

    static close(...args: any[]): void {
        HTML.div({
            id: this.id,
            class: 'collapsed',
        });
    }
}
