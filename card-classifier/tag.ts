import {Tag as CardTag} from "../designation/tag";
import {CardClassifier} from "./card-classifier";

export class Tag extends CardClassifier {
    static name: string = 'Tag';
    static ungrouped_name: string = 'Untagged';

    groups() {
        return this.group_by(
            card => [...card.tags].map(tag => tag.name),
            tag_name => {
                const tag = CardTag.match(tag_name);
                return {
                    name: tag.name,
                    color: tag.hex ? [tag.hex] : null,
                };
            },
        );
    }
}
