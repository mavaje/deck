import {DeckCard} from "../deck-card";
import {DeckView} from "../ui/deck-view";

export interface Action {
    reverse(): Action;
}

const HISTORY: Action[] = [];
const FUTURE: Action[] = [];

function undo(): void {
    const action = HISTORY.pop();
    if (action) {
        FUTURE.push(action.reverse());
    }
}

function redo(): void {
    const action = FUTURE.pop();
    if (action) {
        HISTORY.push(action.reverse());
    }
}

function edit_card_field_action<
    K extends keyof DeckCard
>(
    card: DeckCard,
    field: K,
    new_value: DeckCard[K],
    old_value: DeckCard[K] = card[field],
): Action {
    card[field] = new_value;
    DeckView.render();
    return {
        reverse: () => edit_card_field_action(card, field, old_value),
    };
}

export function edit_card_field<
    K extends keyof DeckCard
>(
    card: DeckCard,
    field: K,
    value: DeckCard[K],
): void {
    HISTORY.push(edit_card_field_action(card, field, value));
}

window.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement) return
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'y':
                if (event.shiftKey) {
                    undo();
                } else {
                    redo();
                }
                break;
            case 'z':
                if (event.shiftKey) {
                    redo();
                } else {
                    undo();
                }
                break;
        }
    }
});
