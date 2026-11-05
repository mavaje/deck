import {ColorSet} from "../color-set";
import {gradient} from "../color";
import {BaseGroup, CardClassifier, Group} from "./card-classifier";
import {DeckCard} from "../deck-card";

export class Color extends CardClassifier<number> {
    static name: string = 'Color';

    static COLOR_GROUPS: Record<string, BaseGroup> = {
        'colorless': {icon: 'public/icon/colorless.svg'},
        'white': {icon: 'public/icon/white.svg'},
        'blue': {icon: 'public/icon/blue.svg'},
        'black': {icon: 'public/icon/black.svg'},
        'red': {icon: 'public/icon/red.svg'},
        'green': {icon: 'public/icon/green.svg'},

        'azorius': {color_space: 'oklab'},
        'dimir': {},
        'rakdos': {},
        'gruul': {},
        'selesnya': {},
        'orzhov': {},
        'izzet': {},
        'golgari': {},
        'boros': {},
        'simic': {color_space: 'oklab'},

        'abzan': {icon: 'public/icon/abzan.webp'},
        'jeskai': {icon: 'public/icon/jeskai.webp'},
        'sultai': {icon: 'public/icon/sultai.webp'},
        'mardu': {icon: 'public/icon/mardu.webp'},
        'temur': {icon: 'public/icon/temur.webp'},
    };

    groups() {
        return this.group_by(
            card => card.main_face().is_type('Land')
                ? 0
                : ColorSet.index(card.main_face().colors()) + 1,
            undefined,
            [
                {name: 'Land', value: 0},
                ...Object.entries(ColorSet.all()).map(([name, colors], index) => ({
                    name,
                    value: index + 1,
                    color: gradient(colors),
                    ...Color.COLOR_GROUPS[name] ?? {},
                } as Group<number>)),
            ],
        );
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.lands_first(a.main_face(), b.main_face())
            || this.compare_number(a, b, card => ColorSet.index(card.main_face().colors()));
    }
}
