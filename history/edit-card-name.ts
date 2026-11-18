import {Action} from "./action";
import {DeckCard} from "../deck-card";
import {Language} from "../designation/language";

export class EditCardName extends Action {

    private old_values: Partial<DeckCard>;
    private reset_card: boolean;

    constructor(
        private card: DeckCard,
        private name: string,
        private face_id: number = card.display_face_id,
    ) {
        super();
    }

    message(): string {
        return `Set card name to ${this.name} (${this.face_id})`;
    }

    execute(): void {
        const {card, name, face_id} = this;
        this.reset_card = !card.has_name(name);
        this.old_values = {
            name: card.name,
            set: card.set,
            collector_number: card.collector_number,
            language: card.language,
            display_face_id: card.display_face_id,
        };
        card.name = name;
        card.display_face_id = face_id;
        if (this.reset_card) {
            card.set = null;
            card.collector_number = null;
            card.language = Language.DEFAULT;
            card.display_face_id = null;
            card.reload();
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
        );
    }

    is_noop(): boolean {
        return this.name === this.card.name
            && this.face_id === this.card.display_face_id;
    }
}

class RevertCardName extends Action {

    constructor(
        private card: DeckCard,
        private values: Partial<DeckCard>,
        private was_reset: boolean,
        private old_name: string,
        private old_face_id: number,
    ) {
        super();
    }

    message(): string {
        return `Revert card name`;
    }

    execute(): void {
        const {card, values, was_reset} = this;
        Object.assign(card, values);
        if (was_reset) card.reload();
        card.render_hooks();
    }

    reverse(): Action {
        return new EditCardName(
            this.card,
            this.old_name,
            this.old_face_id,
        );
    }
}
