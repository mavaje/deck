import {BaseGroup, CardClassifier} from "./card-classifier";
import {Catalog} from "../scryfall/catalog";

export const CARD_TYPES = [
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

export class Type extends CardClassifier {
    static name: string = 'Type';

    static TYPE_GROUPS: Record<string, BaseGroup> = {
        'Land': {icon: 'land.svg'},
        'Artifact': {icon: 'artifact.svg'},
        'Enchantment': {name: '🌟 Enchantment'},
        'Creature': {name: '🐾 Creature'},
        'Battle': {name: '⚔️ Battle'},
        'Planeswalker': {name: '🌀 Planeswalker'},
        'Instant': {name: '⚡️ Instant'},
        'Sorcery': {name: '🔥 Sorcery'},
    };

    groups() {
        return this.group_by(
            card => card.main_face().card_types(),
            undefined,
            Object.fromEntries(CARD_TYPES.map(type => [
                type,
                {
                    name: type,
                    ...Type.TYPE_GROUPS[type] ?? {},
                },
            ])),
        );
    }
}

Catalog.load();
