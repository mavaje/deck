import {DeckCard} from "../deck-card";
import {Test, TestMatcher} from "./test";

export class CardLoadTest extends Test {

    protected pass_message: string = 'Passed all {count} card loading tests';
    protected fail_message: string = 'Passed {passes}/{count} card loading tests (failed {fails})';

    async test(): Promise<void> {
        await Promise.all(Object.entries({
            'forest': {
                name: 'Forest',
                set: null,
                collector_number: null,
                card: {name: 'Forest'},
            },
            'forest *FR*': {card: {name: 'Forest', lang: 'fr'},},
            'forest (KTK)': {card: {name: 'Forest', set: 'ktk'}},
            'forest (KTK) *FR*': {card: {name: 'Forest', set: 'ktk', lang: 'fr'}},
            'forest (KTK:267)': {card: {name: 'Forest', set: 'ktk', collector_number: '267'}},
            'forest (KTK:267) *FR*': {card: {name: 'Forest', set: 'ktk', collector_number: '267', lang: 'fr'}},
            '+2 mace': {card: {name: '+2 Mace'}},
            '_____': {card: {name: '_____'}},
            '______': {card: {name: '______'}},
            '_____ Goblin': {card: {name: '_____ Goblin'}},
            '"Ach! Hans, Run!"': {card: {name: '"Ach! Hans, Run!"'}},
            'Éomer, King of Rohan': {card: {name: 'Éomer, King of Rohan'}},
            'Ætherflux Reservoir': {card: {name: 'Aetherflux Reservoir'}},
        } as Record<string, TestMatcher<DeckCard>>).map(async ([input, expected]) => {
            const card = await DeckCard.parse(input).load();

            if (!card.not_found) {
                this.assert_match(
                    expected,
                    card,
                    `Input "${input}" matched expected fields`,
                    `Input "${input}" did not match expected fields`,
                );

                if (card.card) {
                    const id = card.card.id;
                    await card.reload();

                    this.assert_match(
                        id,
                        card.card.id,
                        `Reloading card "${input}" did not change it`,
                        `Reloading card "${input}" changed it from {expected} to {actual}`,
                    );
                }
            }
        }));
    }
}
