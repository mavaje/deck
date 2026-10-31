import {CardGrouping, Group} from "./card-grouping";
import {Tag} from "../designation/tag";

export const TAG: CardGrouping<Group & {tag: Tag}> = {
    name: 'Tag',
    remainder_group_name: 'Untagged',

    groups: () => Tag.all().map(tag => ({
        name: tag.name,
        color: tag.hex ? [tag.hex] : null,
        tag,
    })),

    test: (card, {tag}) => card.tags.has(tag),
};
