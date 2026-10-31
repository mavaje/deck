import {CardOrdering, string_ordering} from "./card-ordering";

export const NAME: CardOrdering = string_ordering('Name', card => card.card?.name ?? card.name);
