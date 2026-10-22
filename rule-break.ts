import {DeckCard} from "./deck-card";

export type RuleBreakType =
    'additional-color-id' |
    'any-color-id' |
    'no-deck-max';

export class RuleBreak {
    types: string[][];
    min_mv: number = 0;
    used: boolean = false;

    private constructor(private rulebreak: RuleBreakType) {
    }

    static additional_color_id(types: string = null): RuleBreak {
        const rule_break = new RuleBreak('additional-color-id');
        rule_break.types = types
            ?.split(' and ')
            .map(t => t.split(' '));
        return rule_break;
    }

    static any_color_id(types: string, min_mv?: string): RuleBreak {
        const rule_break = new RuleBreak('any-color-id');
        rule_break.types = types
            .split(' and ')
            .map(t => t.split(' '));
        rule_break.min_mv = Number.parseInt(min_mv) || 0;
        return rule_break;
    }

    static no_deck_max(): RuleBreak {
        return new RuleBreak('no-deck-max');
    }

    breaks_color_identity(card: DeckCard): boolean {
        if (card.card.cmc < this.min_mv) return false;

        if (this.types && !card.is_any_type(this.types)) return false;

        switch (this.rulebreak) {
            case 'additional-color-id':
                return !this.used;

            case 'any-color-id':
                return true;

            default:
                return false;
        }
    }

    breaks_deck_limit(): boolean {
        return this.rulebreak === 'no-deck-max';
    }

    use() {
        this.used = true;
    }
}
