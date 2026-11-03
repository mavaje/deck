import {Catalog} from "../scryfall/catalog";
import {CardClassifier} from "./card-classifier";
import {CARD_TYPES} from "./type";

export class Subtype extends CardClassifier {
    static name: string = 'Subtype';
    static ungrouped_name: string = 'Unknown';

    groups() {
        return CARD_TYPES.flatMap(type => {
            const catalog = Catalog.subtypes[type];

            return [
                ...catalog?.all()
                    .map(subtype => ({
                        name: `${type} - ${subtype}`,
                        cards: this.deck.filter(card => card.is_card_type(type) && !card.is_all_types(type) && card.is_type(subtype)),
                    })) ?? [],
                {
                    name: `${type} - (All)`,
                    cards: this.deck.filter(card => card.is_all_types(type)),
                },
                {
                    name: type,
                    cards: this.deck.filter(card => card.is_card_type(type) && !(catalog?.all().some(subtype => card.is_type(subtype)))),
                }
            ];
        })
    }
}

Catalog.load();
