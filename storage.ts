import {Deck} from "./deck";

export class Storage {

    static store_deck(): void {
        window.localStorage.setItem('deck', JSON.stringify(Deck.current.json()));
    }

    static async load_deck(): Promise<void> {
        const json = window.localStorage.getItem('deck');
        if (json) await Deck.load_from_json(JSON.parse(json));
    }
}
