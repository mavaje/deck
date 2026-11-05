import {Catalog} from "../scryfall/catalog";
import {BaseGroup, CardClassifier} from "./card-classifier";
import {Type} from "./type";
import {MTG_COLORS} from "../color";
import {Face} from "../face";

export class Subtype extends CardClassifier {
    static name: string = 'Subtype';

    static SUBTYPE_GROUPS: Record<string, BaseGroup> = {
        'Plains': {icon: 'public/icon/white.svg', color: [MTG_COLORS.white]},
        'Island': {icon: 'public/icon/blue.svg', color: [MTG_COLORS.blue]},
        'Swamp': {icon: 'public/icon/black.svg', color: [MTG_COLORS.black]},
        'Mountain': {icon: 'public/icon/red.svg', color: [MTG_COLORS.red]},
        'Forest': {icon: 'public/icon/green.svg', color: [MTG_COLORS.green]},
    };

    groups() {
        return Type.CARD_TYPE_ORDER.map(type => {
            const catalog = Catalog.subtypes[type];
            const cards = this.cards.filter(card => card.faces().some(face => face.is_card_type(type)));
            if (cards.length === 0) return null;
            return {
                name: type,
                value: type,
                count: cards.count(),
                groups: [
                    ...catalog?.all()
                        .map(subtype => ({
                            name: subtype,
                            value: `${type} - ${subtype}`,
                            cards: cards.filter(card => card.faces().some(face => face.is_specified_type(subtype))),
                            ...Subtype.SUBTYPE_GROUPS[subtype] ?? {},
                        })) ?? [],
                    {
                        name: `All ${type} types`,
                        value: `${type} - *`,
                        cards: cards.filter(card => card.faces().some(face => face.is_all_types(type))),
                    },
                    {
                        value: type,
                        cards: cards.filter(card => !(catalog?.all().some(subtype => card.faces().some(face => face.is_type(subtype))))),
                    }
                ],
                ...Type.TYPE_GROUPS[type] ?? {},
            };
        })
    }

    match_face(face: Face, type_line: string): boolean {
        const [type, subtype] = type_line.split(' - ');
        if (!face.is_card_type(type)) return false;
        if (subtype === '*') {
            return face.is_all_types(type);
        } else if (subtype) {
            return face.is_type(subtype);
        } else {
            return true;
        }
    }
}

Catalog.load();
