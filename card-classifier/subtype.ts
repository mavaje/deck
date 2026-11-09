import {Catalog} from "../scryfall/catalog";
import {CardClassifier} from "./card-classifier";
import {Type} from "./type";
import {MTG_COLORS} from "../color";
import {Face} from "../face";
import {DeckView} from "../ui/deck-view";
import {Group} from "./group";

export class Subtype extends CardClassifier {
    static name: string = 'Subtype';

    static SUBTYPE_ORDER = [
        'Plains',
        'Island',
        'Swamp',
        'Mountain',
        'Forest',
    ];

    static SUBTYPE_GROUPS: Record<string, Partial<Group>> = {
        'Plains': {icon: 'public/icon/white.svg', color: [MTG_COLORS.white]},
        'Island': {icon: 'public/icon/blue.svg', color: [MTG_COLORS.blue]},
        'Swamp': {icon: 'public/icon/black.svg', color: [MTG_COLORS.black]},
        'Mountain': {icon: 'public/icon/red.svg', color: [MTG_COLORS.red]},
        'Forest': {icon: 'public/icon/green.svg', color: [MTG_COLORS.green]},
    };

    static {
        Catalog.load();
    }

    split_by_face: boolean = true;

    groups(): Group[] {
        return Type.CARD_TYPE_ORDER.map(type => {
            const catalog = Catalog.subtypes[type];
            const cards = this.cards.filter(card => DeckView.FACE_SELECTOR.get(card).some(face => face.is_card_type(type)));
            if (cards.length === 0) return null;
            return new Group({
                name: type,
                value: type,
                groups: [
                    ...catalog?.all()
                        .map(subtype => new Group({
                            name: subtype,
                            value: `${type} - ${subtype}`,
                            cards: cards.filter(card => DeckView.FACE_SELECTOR.get(card).some(face => face.is_specified_type(subtype))),
                            ...Subtype.SUBTYPE_GROUPS[subtype] ?? {},
                        }))
                        .sort((a, b) => {
                            let index_a = Subtype.SUBTYPE_ORDER.indexOf(a.name);
                            if (index_a === -1) index_a = Infinity;
                            let index_b = Subtype.SUBTYPE_ORDER.indexOf(b.name);
                            if (index_b === -1) index_b = Infinity;
                            return index_a - index_b;
                        }) ?? [],
                    new Group({
                        name: `All ${type} types`,
                        value: `${type} - *`,
                        cards: cards.filter(card => DeckView.FACE_SELECTOR.get(card).some(face => face.is_all_types(type))),
                    }),
                    new Group({
                        value: type,
                        cards: cards.filter(card => !(catalog?.all().some(subtype => DeckView.FACE_SELECTOR.get(card).some(face => face.is_type(subtype))))),
                    }),
                ],
                ...Type.TYPE_GROUPS[type] ?? {},
            });
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
