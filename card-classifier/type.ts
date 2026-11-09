import {CardClassifier} from "./card-classifier";
import {Catalog} from "../scryfall/catalog";
import {Face} from "../face";
import {Group} from "./group";

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
        'Stickers',
        'Plane',
        'Phenomenon',
        'Scheme',
        'Boss',
        'Event',
        'Token',
        'Emblem',
        'Dungeon',
        'Card',
    ];

    static TYPE_GROUPS: Record<string, Partial<Group>> = {
        'Land': {icon: 'public/icon/land.svg'},
        'Artifact': {icon: 'public/icon/artifact.svg'},
        'Enchantment': {icon: 'public/icon/enchantment.svg'},
        'Creature': {icon: 'public/icon/creature.svg'},
        'Battle': {icon: 'public/icon/battle.svg'},
        'Planeswalker': {icon: 'public/icon/planeswalker.svg'},
        'Instant': {icon: 'public/icon/instant.svg'},
        'Sorcery': {icon: 'public/icon/sorcery.svg'},
    };

    static {
        Catalog.load();
    }

    split_by_face: boolean = true;

    groups() {
        return this.group_by_face(
            face => face.card_types(),
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
}
