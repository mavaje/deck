import {CardClassifier} from "./card-classifier";
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

    groups() {
        return this.group_by(
            card => card.card_types(),
            undefined,
            Object.fromEntries(CARD_TYPES.map(type => [type, {name: type}])),
        );
    }
}

Catalog.load();
