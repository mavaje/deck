import {BaseGroup, CardClassifier} from "./card-classifier";
import {Catalog} from "../scryfall/catalog";
import {Face} from "../face";

export class Type extends CardClassifier {
    static name: string = 'Type';

    static CARD_TYPE_ORDER = [
        'Vanguard',
        'Hero',
        'Conspiracy',

        'Land',
        'Artifact',
        'Enchantment',
        'Creature',
        'Battle',
        'Planeswalker',
        'Instant',
        'Sorcery',

        'Kindred',
        'Emblem',
        'Dungeon',
        'Plane',
        'Phenomenon',
        'Scheme',
        'Boss',
        'Event',
    ];

    static TYPE_GROUPS: Record<string, BaseGroup> = {
        'Land': {icon: 'public/icon/land.svg'},
        'Artifact': {icon: 'public/icon/artifact.svg'},
        'Enchantment': {icon: 'public/icon/enchantment.svg'},
        'Creature': {icon: 'public/icon/creature.svg'},
        'Battle': {icon: 'public/icon/battle.svg'},
        'Planeswalker': {icon: 'public/icon/planeswalker.svg'},
        'Instant': {icon: 'public/icon/instant.svg'},
        'Sorcery': {icon: 'public/icon/sorcery.svg'},
    };

    groups() {
        return this.group_by(
            card => card.faces().flatMap(face => face.card_types()),
            undefined,
            Object.fromEntries(Type.CARD_TYPE_ORDER.map(type => [
                type,
                {
                    name: type,
                    value: type,
                    ...Type.TYPE_GROUPS[type] ?? {},
                },
            ])),
        );
    }

    match_face(face: Face, type: string): boolean {
        return face.is_card_type(type);
    }
}

Catalog.load();
