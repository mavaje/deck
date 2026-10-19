import {Test, TestValue} from "./test";
import {Deck} from "../deck";

export class DeckLoadTest extends Test {

    protected pass_message: string = 'Passed all {count} deck loading tests';
    protected fail_message: string = 'Passed {passes}/{count} deck loading tests (failed {fails})';

    async test(): Promise<void> {
        const input = `
forest
forest *FR*
_____
______
`.trim();

        const deck = await Deck.parse(input).load();

        this.assert_match(
            {
                cards: [
                    {card: {oracle_id: 'b34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6'}},
                    {card: {oracle_id: 'b34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6', lang: 'fr'}},
                    {card: {oracle_id: '4e536142-4ebe-4062-887b-5dd123c41d39'}},
                    {card: {oracle_id: '571ccaf0-d2a0-46d3-af4b-14245a9a79ff'}},
                ],
            } as TestValue<Deck>,
            deck
        );
    }
}
