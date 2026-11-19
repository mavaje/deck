import {Action} from "./action";
import {DeckCard} from "../deck-card";

export class EditCardFields extends Action {

    private old_fields: Partial<DeckCard>;

    constructor(
        private card: DeckCard,
        private fields: Partial<DeckCard>,
    ) {
        super();
    }

    message(): string {
        return `Set card ${Object.entries(this.fields)
            .map(([key, value]) => `${key} to ${value}`)
            .join(', ')}`;
    }

    execute(): void {
        const {card, fields} = this;
        this.old_fields = {};
        Object.keys(fields).forEach(key => this.old_fields[key] = card[key]);
        Object.assign(card, fields);
        if (([
            'name',
            'set',
            'collector_number',
            'language',
        ] as (keyof DeckCard)[]).some(field => field in fields)) {
            card.reload();
        }
        card.render_hooks();
    }

    reverse(): Action {
        return new EditCardFields(
            this.card,
            this.old_fields,
        );
    }

    is_noop(): boolean {
        return Object.entries(this.fields)
            .every(([key, value]) => this.card[key] === value);
    }
}
