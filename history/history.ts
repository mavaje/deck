import {DeckCard} from "../deck-card";
import {Card} from "../scryfall/types";
import {Language} from "../designation/language";

export interface Action {
    name?: string;
    reverse(): Action;
}

const HISTORY: Action[] = [];
const FUTURE: Action[] = [];

function undo(): void {
    const action = HISTORY.pop();
    if (action) FUTURE.push(action.reverse());
    console.log(HISTORY.map(({name}) => name));
}

function redo(): void {
    const action = FUTURE.pop();
    if (action) HISTORY.push(action.reverse());
    console.log(HISTORY.map(({name}) => name));
}

function log_action(action: Action): void {
    HISTORY.push(action);
    FUTURE.splice(0, FUTURE.length);
    console.log(HISTORY.map(({name}) => name));
}

export function reset_history(): void {
    HISTORY.splice(0, HISTORY.length);
    FUTURE.splice(0, FUTURE.length);
}

function edit_card_field_action<
    K extends keyof DeckCard
>(
    card: DeckCard,
    field: K,
    new_value: DeckCard[K],
): Action {
    const old_value: DeckCard[K] = card[field];
    card[field] = new_value;
    if (([
        'name',
        'set',
        'collector_number',
        'language',
    ] as (keyof DeckCard)[]).includes(field)) {
        card.reload();
    }
    card.render_hooks();
    return {
        name: `Set card ${field} to ${new_value}`,
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
    if (card[field] === value) return;
    log_action(edit_card_field_action(card, field, value));
}

function edit_card_name_action(
    card: DeckCard,
    new_name: string,
    new_face_id: number,
): Action {
    const has_name = !card.has_name(new_name);
    const {name, set, collector_number, language, display_face_id} = card;
    card.name = new_name;
    card.display_face_id = new_face_id;
    if (has_name) {
        card.set = null;
        card.collector_number = null;
        card.language = Language.DEFAULT;
        card.display_face_id = null;
        card.reload();
    }
    card.render_hooks();
    return {
        name: `Set card name to ${new_name} (${new_face_id})`,
        reverse: () => {
            card.name = name;
            card.display_face_id = display_face_id;
            if (has_name) {
                Object.assign(card, {set, collector_number, language});
                card.reload();
            }
            card.render_hooks();
            return {
                name: `Revert card name`,
                reverse: () => edit_card_name_action(card, new_name, new_face_id),
            };
        },
    };
}

export function edit_card_name(
    card: DeckCard,
    value: string,
    display_face_id: number = card.display_face_id,
): void {
    if (card.name === value
        && card.display_face_id === display_face_id
    ) {
        return;
    }
    log_action(edit_card_name_action(card, value, display_face_id));
}

export function set_card_printing_action(
    card: DeckCard,
    printing: Card,
): Action {
    const {name, set, collector_number, language, finish, card: sf_card} = card;
    card.hydrate_printing(printing);
    return {
        name: `Set card printing to ${printing.set.toUpperCase()}:${printing.collector_number}`,
        reverse: () => {
            Object.assign(card, {name, set, collector_number, language, finish});
            card.hydrate(sf_card);
            return {
                name: 'Reverted card printing',
                reverse: () => set_card_printing_action(card, printing),
            };
        },
    };
}

export function set_card_printing(
    card: DeckCard,
    printing: Card,
): void {
    if (printing.id === card.card?.id
        && printing.name === card.card_name()
        && printing.set === card.set
        && printing.collector_number === card.collector_number
        && printing.lang === card.language.code()
        && printing.finishes.includes(card.finish.sf_finish())
    ) {
        return;
    }
    log_action(set_card_printing_action(card, printing));
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
                event.preventDefault();
                break;
            case 'z':
                if (event.shiftKey) {
                    redo();
                } else {
                    undo();
                }
                event.preventDefault();
                break;
        }
    }
});
