import {Action} from "./action";
import {Deck} from "../deck";
import {DeckPanel} from "../ui/deck/deck-panel";
import {DeckView} from "../ui/deck-view";

export class EditDeckField<K extends keyof Deck & string> extends Action {

    private old_value: Deck[K];

    constructor(
        private field: K,
        private value: Deck[K],
    ) {
        super();
    }

    message(): string {
        return `Set deck ${this.field} to ${this.value}`;
    }

    execute(): void {
        const {field, value} = this;
        this.old_value = Deck.CURRENT[field];
        Deck.CURRENT[field] = value;
        DeckPanel.update();
        DeckView.render();
        if (field === 'game') {
            Deck.CURRENT.load(() => DeckView.render());
        }
    }

    reverse(): Action {
        return new EditDeckField(
            this.field,
            this.old_value,
        );
    }

    is_noop(): boolean {
        const {field, value} = this;
        return value === Deck.CURRENT[field];
    }
}
