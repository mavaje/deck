import {CardClassifier} from "./card-classifier";
import {Zone as CardZone} from "../designation/zone";
import {Group} from "./group";

export class Zone extends CardClassifier {
    static name: string = 'Zone';

    groups() {
        return CardZone.all().map(zone => new Group({
            name: zone.name,
            value: zone.code(),
            cards: this.cards.filter(card => card.in_zone(zone)),
        }));
    }
}
