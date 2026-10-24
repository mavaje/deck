import {Test, TestMatcher} from "./test";
import {Deck} from "../deck";

export class DeckLoadTest extends Test {

    protected pass_message: string = 'Passed all {count} deck loading tests';
    protected fail_message: string = 'Passed {passes}/{count} deck loading tests (failed {fails})';

    async test(): Promise<void> {
        const input = `
forest
forest (ktk)
forest (ktk:267)
forest *FR*
_____
______
`.trim();

        const deck = Deck.parse(input);
        await deck.load();

        this.assert_match(
            {
                cards: [
                    {card: {name: 'Forest'}},
                    {card: {name: 'Forest', set: 'ktk'}},
                    {card: {name: 'Forest', set: 'ktk', collector_number: '267'}},
                    {card: {name: 'Forest', lang: 'fr'}},
                    {card: {name: '_____'}},
                    {card: {name: '______'}},
                ],
            } as TestMatcher<Deck>,
            deck
        );
    }
}
