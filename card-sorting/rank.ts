import {CardOrdering, numeric_ordering} from "./card-ordering";

export const RANK_EDHREC: CardOrdering = numeric_ordering('Rank - EDHREC', card => card.card?.edhrec_rank);

export const RANK_PENNY: CardOrdering = numeric_ordering('Rank - Penny', card => card.card?.penny_rank);
