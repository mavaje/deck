import {Action} from "./action";
import {DeckCard} from "../deck-card";

export class EditCardField<
    K extends keyof DeckCard
> extends Action {

    private old_value: DeckCard[K];

    constructor(
        private card: DeckCard,
        private field: K,
        private value: DeckCard[K],
    ) {
        super();
    }

    message(): string {
        return `Set card ${this.field} to ${this.value}`;
    }

    execute(): void {
        const {card, field, value} = this;
        this.old_value = card[field];
        card[field] = value;
        if (([
            'name',
            'set',
            'collector_number',
            'language',
        ] as (keyof DeckCard)[]).includes(field)) {
            card.reload();
        }
        card.render_hooks();
    }

    reverse(): Action {
        return new EditCardField(
            this.card,
            this.field,
            this.old_value,
        );
    }

    is_noop(): boolean {
        return this.value === this.old_value;
    }
}
