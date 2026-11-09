import {Tag as CardTag} from "../designation/tag";
import {CardClassifier} from "./card-classifier";
import {Group} from "./group";

export class Tag extends CardClassifier<string> {
    static name: string = 'Tag';
    static ungrouped_name: string = 'Untagged';

    groups(): Group<string>[] {
        return this.group_by(
            card => [...card.tags].map(tag => tag.name),
            tag_name => {
                const tag = CardTag.match(tag_name);
                return tag ? {
                    name: tag.name,
                    value: tag.name,
                    color: tag.hex ? [tag.hex] : null,
                } : null;
            },
        );
    }
}
