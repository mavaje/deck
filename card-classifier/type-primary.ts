import {CardClassifier} from "./card-classifier";
import {Face} from "../face";
import {Group} from "./group";
import {Type} from "./type";
import {DeckCard} from "../deck-card";

export class TypePrimary extends CardClassifier {
    static name: string = 'Type - Primary';

    static PRIMARY_TYPE_ORDER = [
        'Token',
        'Land',
        'Planeswalker',
        'Creature',
        'Battle',
        'Artifact',
        'Enchantment',
        'Instant',
        'Sorcery',
    ];

    split_by_face: boolean = true;

    static primary_type(card: Face): string {
        return TypePrimary.PRIMARY_TYPE_ORDER.find(type => card.is_card_type(type))
            ?? card.card_types()[0];
    }

    groups() {
        return this.group_by_face(
            face => TypePrimary.primary_type(face),
            undefined,
            Object.fromEntries(Type.CARD_TYPE_ORDER.map(type => [
                type,
                new Group({
                    name: type,
                    value: type,
                    ...Type.TYPE_GROUPS[type] ?? {},
                }),
            ])),
        );
    }

    match_face(face: Face, type: string): boolean {
        return face.is_card_type(type);
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.compare_card_index(
            a,
            b,
            face => TypePrimary.primary_type(face),
            Type.CARD_TYPE_ORDER,
        );
    }
}
