import {CardClassifier} from "./card-classifier";

export class Keyword extends CardClassifier {
    static name: string = 'Keyword';
    static ungrouped_name: string = 'No Keywords';

    groups() {
        return this.group_by(card => card.card?.keywords);
    }
}
