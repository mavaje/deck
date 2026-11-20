import {CardClassifier} from "./card-classifier";
import {Zone as CardZone} from "../designation/zone";
import {Group} from "./group";

export class Zone extends CardClassifier {
    static name: string = 'Zone';

    static ZONE_GROUPS: Record<string, Partial<Group>> = {
        'cmdr': {icon: 'public/icon/commander.svg'},
        'cmpn': {icon: 'public/icon/companion.svg'},
    };

    groups() {
        return CardZone.all().map(zone => new Group({
            name: zone.name,
            value: zone.code(),
            cards: this.cards.filter(card => card.in_zone(zone)),
            ...Zone.ZONE_GROUPS[zone.code()] ?? {},
        }));
    }
}
