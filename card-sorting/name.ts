import {CardOrdering, string_ordering} from "./card-ordering";
import {Language} from "../designation/language";

export const NAME: CardOrdering = string_ordering(
    'Name',
        card => (card.card.lang === Language.DEFAULT.code()
            ? card.face('printed_name')
            : null) ?? card.face('name'),
);
