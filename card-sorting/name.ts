import {CardOrdering, string_ordering} from "./card-ordering";

export const NAME: CardOrdering = string_ordering(
    'Name',
    card => card.main_face().card_name(card.is_default_language()),
);
