import {ColorSet} from "../color-set";
import {gradient} from "../color";
import {CardClassifier} from "./card-classifier";
import {DeckCard} from "../deck-card";
import {Type} from "./type";
import {Group} from "./group";

export class Color extends CardClassifier<number> {
    static name: string = 'Color';

    static COLOR_GROUPS: Record<string, Partial<Group>> = {
        'colorless': {icon: 'public/icon/colorless.svg'},
        'white': {icon: 'public/icon/white.svg'},
        'blue': {icon: 'public/icon/blue.svg'},
        'black': {icon: 'public/icon/black.svg'},
        'red': {icon: 'public/icon/red.svg'},
        'green': {icon: 'public/icon/green.svg'},

        'azorius': {icon: 'public/icon/azorius.webp'},
        'dimir': {icon: 'public/icon/dimir.webp'},
        'rakdos': {icon: 'public/icon/rakdos.webp'},
        'gruul': {icon: 'public/icon/gruul.webp'},
        'selesnya': {icon: 'public/icon/selesnya.webp'},
        'orzhov': {icon: 'public/icon/orzhov.webp'},
        'izzet': {icon: 'public/icon/izzet.webp'},
        'golgari': {icon: 'public/icon/golgari.webp'},
        'boros': {icon: 'public/icon/boros.webp'},
        'simic': {icon: 'public/icon/simic.webp'},

        'abzan': {icon: 'public/icon/abzan.webp'},
        'jeskai': {icon: 'public/icon/jeskai.webp'},
        'sultai': {icon: 'public/icon/sultai.webp'},
        'mardu': {icon: 'public/icon/mardu.webp'},
        'temur': {icon: 'public/icon/temur.webp'},
    };

    split_by_face: boolean = true;

    groups() {
        return this.group_by_face(
            face => face.is_type('Land')
                ? 0
                : ColorSet.index(face.colors()) + 1,
            undefined,
            [
                new Group({
                    name: 'Land',
                    value: 0,
                    ...Type.TYPE_GROUPS['Land'],
                }),
                ...Object.entries(ColorSet.all()).map(([name, colors], index) => new Group({
                    name,
                    value: index + 1,
                    color: gradient(colors),
                    ...Color.COLOR_GROUPS[name] ?? {},
                })),
            ],
        );
    }

    compare(a: DeckCard, b: DeckCard): number {
        return this.lands_first(a, b)
            || this.compare_card_number(a, b, face => ColorSet.index(face.colors()));
    }
}
