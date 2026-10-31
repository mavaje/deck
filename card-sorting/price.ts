import {CardOrdering, numeric_ordering} from "./card-ordering";

export const PRICE_USD: CardOrdering = numeric_ordering('Price - USD', card => Number.parseFloat(card.card?.prices?.usd));

export const PRICE_EUR: CardOrdering = numeric_ordering('Price - EUR', card => Number.parseFloat(card.card?.prices?.eur));

export const PRICE_TIX: CardOrdering = numeric_ordering('Price - TIX', card => Number.parseFloat(card.card?.prices?.tix));
