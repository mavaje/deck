import {DeckCard} from "./deck-card";

export type RuleBreakType =
    'additional-color-id' |
    'any-color-id' |
    'no-deck-max' |
    'reduced-deck-min';

export class RuleBreak {

    private constructor(
        protected no_deck_max: boolean = false,
        protected deck_min_reduction: number = 0,
        protected extra_colors: number = 0,
        protected types: string[][] = null,
        protected min_mv: number = 0,
    ) {}

    private static parse_types(types: string): string[][] {
        return types
            ?.split(' and ')
            .map(t => t.split(' '));
    }

    static additional_color_id(types: string = null, min_mv?: string): RuleBreak {
        return new RuleBreak(
            undefined,
            undefined,
            1,
            this.parse_types(types),
            Number.parseInt(min_mv) || 0,
        );
    }

    static any_color_id(types: string, min_mv?: string): RuleBreak {
        return new RuleBreak(
            undefined,
            undefined,
            Infinity,
            this.parse_types(types),
            Number.parseInt(min_mv) || 0,
        );
    }

    static no_deck_max(): RuleBreak {
        return new RuleBreak(
            true,
        );
    }

    static reduced_deck_min(reduction: number): RuleBreak {
        return new RuleBreak(
            undefined,
            reduction,
        );
    }

    breaks_color_identity(card: DeckCard): boolean {
        if (card.card.cmc < this.min_mv) return false;

        if (this.types && !card.is_any_type(this.types)) return false;

        return this.extra_colors > 0;
    }

    breaks_deck_max(): boolean {
        return this.no_deck_max;
    }

    breaks_deck_min(): number {
        return this.deck_min_reduction;
    }

    use() {
        this.extra_colors -= 1;
    }
}
