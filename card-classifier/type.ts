import {CardClassifier} from "./card-classifier";
import {Catalog} from "../scryfall/catalog";
import {CARD_TYPES} from "../card-types";

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
