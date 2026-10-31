import {CardGrouping, Group} from "./card-grouping";
import {CARD_TYPES} from "../card-types";
import {Catalog} from "../scryfall/catalog";

export const SUBTYPE: CardGrouping<Group & {
    type: string;
    subtype?: string;
    catalog?: Catalog;
}> = {
    name: 'Type - Subtype',

    groups: () => CARD_TYPES.flatMap(type => {
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

        if (catalog) {
            return [
                ...catalog.all()
                    .map(subtype => ({
                        name: `${type} - ${subtype}`,
                        type,
                        subtype,
                    })),
                {
                    name: type,
                    type,
                    catalog,
                }
            ];
        } else {
            return {
                name: type,
                type,
            };
        }
    }),

    test(card, {type, subtype, catalog}) {
        if (!card.is_type(type)) return false;

        if (subtype) {
            return card.is_type(subtype);
        } else if (catalog) {
            return !catalog.all().some(t => card.is_type(t));
        }

        return true;
    },
};

Catalog.load();
