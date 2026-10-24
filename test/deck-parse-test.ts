import {Test} from "./test";
import {Deck} from "../deck";
import {DeckCard} from "../deck-card";
import {Board} from "../designation/board";
import {Finish} from "../designation/finish";

export class DeckParseTest extends Test {

    protected pass_message: string = 'Passed all {count} deck parsing tests';
    protected fail_message: string = 'Passed {passes}/{count} deck parsing tests (failed {fails})';

    async test(): Promise<void> {
        const input = `About
Name Jace, Reforging the multiverse

Commander
1 Jace, Multiverse Architect

//Deck (40)
10x Black Lotus (2ed) 233 [Artifact]
1x Esika, God of the Tree // The Prismatic Bridge (khm) 168 [Creature]
1x Forest (plst) AKH-268 [Land]
2x Island (plst) AKH-258 [Land]
1x Lightning Bolt (a25) 141 [Instant]
1x Nezumi Graverobber // Nighteyes the Desecrator (plst) CHK-129 [Creature]
2x Sensei's Divining Top (ema) 232 *F* [Good Stuff] ^Don't Have,#f47373^
2x Swamp (gk1) 25 [Land]
1x Tovolar, Dire Overlord // Tovolar, the Midnight Scourge (mid) 311 [Commander{top}]
lightning bolt [sb]
turn // burn

//Sideboard
lightning bolt
`.trim();

        const deck = Deck.parse(input);

        this.assert_match(
            {
                cards: [
                    new DeckCard({quantity: 1, name: 'Jace, Multiverse Architect', board: Board.commander}),
                    new DeckCard({quantity: 10, name: 'Black Lotus', set: '2ED', collector_number: '233', tags: ['Artifact']}),
                    new DeckCard({quantity: 1, name: 'Esika, God of the Tree // The Prismatic Bridge', set: 'KHM', collector_number: '168', tags: ['Creature']}),
                    new DeckCard({quantity: 1, name: 'Forest', set: 'PLST', collector_number: 'AKH-268', tags: ['Land']}),
                    new DeckCard({quantity: 2, name: 'Island', set: 'PLST', collector_number: 'AKH-258', tags: ['Land']}),
                    new DeckCard({quantity: 1, name: 'Lightning Bolt', set: 'A25', collector_number: '141', tags: ['Instant']}),
                    new DeckCard({quantity: 1, name: 'Nezumi Graverobber // Nighteyes the Desecrator', set: 'PLST', collector_number: 'CHK-129', tags: ['Creature']}),
                    new DeckCard({quantity: 2, name: 'Sensei\'s Divining Top', set: 'EMA', collector_number: '232', finish: Finish.foil, tags: ['Good Stuff', 'Don\'t Have']}),
                    new DeckCard({quantity: 2, name: 'Swamp', set: 'GK1', collector_number: '25', tags: ['Land']}),
                    new DeckCard({quantity: 1, name: 'Tovolar, Dire Overlord // Tovolar, the Midnight Scourge', set: 'MID', collector_number: '311', board: Board.commander}),
                    new DeckCard({quantity: 2, name: 'lightning bolt', board: Board.sideboard}),
                    new DeckCard({quantity: 1, name: 'turn // burn'}),
                ],
            },
            deck
        );
    }
}
