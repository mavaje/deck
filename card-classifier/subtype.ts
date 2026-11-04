import {Catalog} from "../scryfall/catalog";
import {BaseGroup, CardClassifier, CardGroup} from "./card-classifier";
import {CARD_TYPES, Type} from "./type";
import {MTG_COLORS} from "../color";

export class Subtype extends CardClassifier {
    static name: string = 'Subtype';

    static SUBTYPE_GROUPS: Record<string, BaseGroup> = {
        'Plains': {name: '☀️ Plains', color: [MTG_COLORS.white]},
        'Island': {name: '💧 Island', color: [MTG_COLORS.blue]},
        'Swamp': {name: '💀 Swamp', color: [MTG_COLORS.black]},
        'Mountain': {name: '🔥 Mountain', color: [MTG_COLORS.red]},
        'Forest': {name: '🌳 Forest', color: [MTG_COLORS.green]},
    };

    groups() {
        return CARD_TYPES.map(type => {
            const catalog = Catalog.subtypes[type];
            const cards = this.cards.filter(card => card.main_face().is_card_type(type));
            if (cards.length === 0) return null;
            return {
                name: type,
                count: cards.count(),
                groups: [
                    ...catalog?.all()
                        .map(subtype => ({
                            name: subtype,
                            cards: cards.filter(card => card.main_face().is_specified_type(subtype)),
                            ...Subtype.SUBTYPE_GROUPS[subtype] ?? {},
                        } as CardGroup)) ?? [],
                    {
                        name: `Every ${type} type`,
                        cards: cards.filter(card => card.main_face().is_all_types(type)),
                    },
                    {
                        cards: cards.filter(card => !(catalog?.all().some(subtype => card.main_face().is_type(subtype)))),
                    }
                ],
                ...Type.TYPE_GROUPS[type] ?? {},
            };
        })
    }
}

Catalog.load();
