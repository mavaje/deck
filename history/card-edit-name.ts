import {Action} from "./action";
import {DeckCard} from "../deck-card";
import {Language} from "../designation/language";
import {Deck} from "../deck";
import {NameKey} from "../face";

export class CardEditName extends Action {

    private old_values: Partial<DeckCard>;
    private reset_card: boolean;

    constructor(
        private card: DeckCard,
        private name: string,
        private face_id: number = card.display_face_id,
        private name_key: NameKey = card.display_name_key,
    ) {
        super();
    }

    message(): string {
        const {name, face_id, name_key} = this;
        return `Set card name to ${name} (${face_id}:${name_key})`;
    }

    execute(): void {
        const {card, name, face_id, name_key} = this;
        this.reset_card = !card.selectable_names()[name];
        this.old_values = {
            name: card.name,
            set: card.set,
            collector_number: card.collector_number,
            language: card.language,
            display_face_id: card.display_face_id,
            display_name_key: card.display_name_key,
        };
        card.name = name;
        card.display_face_id = face_id;
        card.display_name_key = name_key;
        if (this.reset_card) {
            card.set = null;
            card.collector_number = null;
            card.language = Language.DEFAULT;
            card.display_face_id = null;
            card.display_name_key = 'flavor_name';
            card.reload(Deck.CURRENT.game);
        }
        card.render_hooks();
    }

    reverse(): Action {
        return new RevertCardName(
            this.card,
            this.old_values,
            this.reset_card,
            this.name,
            this.face_id,
            this.name_key,
        );
    }

    is_noop(): boolean {
        return this.name === this.card.name
            && this.face_id === this.card.display_face_id
            && this.name_key === this.card.display_name_key;
    }
}

class RevertCardName extends Action {

    constructor(
        private card: DeckCard,
        private values: Partial<DeckCard>,
        private was_reset: boolean,
        private old_name: string,
        private old_face_id: number,
        private old_name_key: NameKey,
    ) {
        super();
    }

    message(): string {
        return `Revert card name`;
    }

    execute(): void {
        const {card, values, was_reset} = this;
        Object.assign(card, values);
        if (was_reset) card.reload(Deck.CURRENT.game);
        card.render_hooks();
    }

    reverse(): Action {
        return new CardEditName(
            this.card,
            this.old_name,
            this.old_face_id,
            this.old_name_key,
        );
    }
}
