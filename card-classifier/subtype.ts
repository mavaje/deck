import {CARD_TYPES} from "../card-types";
import {Catalog} from "../scryfall/catalog";
import {CardClassifier} from "./card-classifier";

export class Subtype extends CardClassifier {
    static name: string = 'Subtype';
    static ungrouped_name: string = 'Unknown';

    groups() {
        return CARD_TYPES.flatMap(type => {
            const catalog = {
                'Land': Catalog.land_types,
                'Artifact': Catalog.artifact_types,
                'Enchantment': Catalog.enchantment_types,
                'Creature': Catalog.creature_types,
                'Kindred': Catalog.creature_types,
                'Battle': Catalog.battle_types,
                'Planeswalker': Catalog.planeswalker_types,
                'Instant': Catalog.spell_types,
                'Sorcery': Catalog.spell_types,
            }[type];

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
