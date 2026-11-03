import {Catalog} from "../scryfall/catalog";
import {CardClassifier} from "./card-classifier";
import {CARD_TYPES} from "./type";

export class Subtype extends CardClassifier {
    static name: string = 'Subtype';

    groups() {
        return CARD_TYPES.flatMap(type => {
            const catalog = Catalog.subtypes[type];

            return [
                ...catalog?.all()
                    .map(subtype => ({
                        name: `${type} - ${subtype}`,
                        cards: this.cards.filter(card => card.main_face().is_card_type(type) && !card.main_face().is_all_types(type) && card.main_face().is_type(subtype)),
                    })) ?? [],
                {
                    name: `${type} - (All)`,
                    cards: this.cards.filter(card => card.main_face().is_all_types(type)),
                },
                {
                    name: type,
                    cards: this.cards.filter(card => card.main_face().is_card_type(type) && !(catalog?.all().some(subtype => card.main_face().is_type(subtype)))),
                }
            ];
        })
    }
}

setTimeout(() => Catalog.load());
