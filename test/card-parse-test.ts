import {DeckCard} from "../deck-card";
import {Test} from "./test";
import {Language} from "../designation/language";
import {Board} from "../designation/board";
import {Condition} from "../designation/condition";
import {Finish} from "../designation/finish";

export class CardParseTest extends Test {

    protected pass_message: string = 'Passed all {count} card parsing tests';
    protected fail_message: string = 'Passed {passes}/{count} card parsing tests (failed {fails})';

    async test(): Promise<void> {
        Object.entries({
            // quantity tests
            'forest': new DeckCard({name: 'forest'}),
            '3 forest': new DeckCard({quantity: 3, name: 'forest'}),
            '3x forest': new DeckCard({quantity: 3, name: 'forest'}),
            '3* forest': new DeckCard({quantity: 3, name: 'forest'}),
            '3× forest': new DeckCard({quantity: 3, name: 'forest'}),
            '0 forest': new DeckCard({quantity: 0, name: 'forest'}),
            '999 forest': new DeckCard({quantity: 999, name: 'forest'}),
            '1000 forest': new DeckCard({name: '1000 forest'}),
            '-1 forest': new DeckCard({name: '-1 forest'}),
            '3forest': new DeckCard({name: '3forest'}),

            // language tests
            'forest *en*': new DeckCard({name: 'forest', language: Language.english}),
            'forest *EN*': new DeckCard({name: 'forest', language: Language.english}),
            'forest *English*': new DeckCard({name: 'forest', language: Language.english}),
            'forest *sp*': new DeckCard({name: 'forest', language: Language.spanish}),
            'forest *spanish*': new DeckCard({name: 'forest', language: Language.spanish}),

            // TappedOut
            '1x Llanowar Elves (M10)': new DeckCard({quantity: 1, name: 'Llanowar Elves', set: 'M10'}),
            '1x Greven Il Vec *CMDR*': new DeckCard({quantity: 1, name: 'Greven Il Vec', board: Board.commander}),
            '1x Gyruda, Doom of Depths *CMPN*': new DeckCard({quantity: 1, name: 'Gyruda, Doom of Depths', board: Board.companion}),
            '1x Mishra\'s Factory (ATQ:1074)': new DeckCard({quantity: 1, name: 'Mishra\'s Factory', set: 'ATQ', collector_number: '1074'}),
            '1x Llanowar Elves *GE*': new DeckCard({quantity: 1, name: 'Llanowar Elves', language: Language.german}),
            '1x Llanowar Elves *SL*': new DeckCard({quantity: 1, name: 'Llanowar Elves', condition: Condition.slightly_played}),
            '1x Llanowar Elves *mythic*': new DeckCard({quantity: 1, name: 'Llanowar Elves', tags: this.tag_set('mythic')}),
            '1x Llanowar Elves *CMC:20*': new DeckCard({quantity: 1, name: 'Llanowar Elves', tags: this.tag_set('CMC:20')}),
            '1x Llanowar Elves (M10) *F* *IT* *SL*': new DeckCard({quantity: 1, name: 'Llanowar Elves', set: 'M10', finish: Finish.foil, language: Language.italian, condition: Condition.slightly_played}),
            '1x Island #Land': new DeckCard({quantity: 1, name: 'Island', tags: this.tag_set('Land')}),
            '1x Storm Crow #Wincon': new DeckCard({quantity: 1, name: 'Storm Crow', tags: this.tag_set('Wincon')}),
            '1x Llanowar Elves #Category_With_Spaces': new DeckCard({quantity: 1, name: 'Llanowar Elves', tags: this.tag_set('Category_With_Spaces')}),
            '4x Llanowar Elves *Need: 2*': new DeckCard({quantity: 4, name: 'Llanowar Elves', tags: this.tag_set('Need: 2')}),

            // Archidekt
            '2 Sensei\'s Divining Top': new DeckCard({quantity: 2, name: 'Sensei\'s Divining Top'}),
            '2x Sensei\'s Divining Top': new DeckCard({quantity: 2, name: 'Sensei\'s Divining Top'}),
            '1 Mountain (DOM) 263': new DeckCard({quantity: 1, name: 'Mountain', set: 'DOM', collector_number: '263'}),
            '1 Counterspell': new DeckCard({quantity: 1, name: 'Counterspell'}),
            '1 Path to Exile': new DeckCard({quantity: 1, name: 'Path to Exile'}),
            '2x Sol Ring': new DeckCard({quantity: 2, name: 'Sol Ring'}),
            '1x Path to Exile (cmm) [Removal] ^To Remove,#FF0000^': new DeckCard({quantity: 1, name: 'Path to Exile', set: 'CMM', tags: this.tag_set('Removal', 'To Remove')}),
            '1 Wrath of God': new DeckCard({quantity: 1, name: 'Wrath of God'}),
            '2 Island': new DeckCard({quantity: 2, name: 'Island'}),
            '1 Forest': new DeckCard({quantity: 1, name: 'Forest'}),

            // Edge Cases
            '1 Hazmat Suit (Used)': new DeckCard({quantity: 1, name: 'Hazmat Suit (Used)'}),
            '1 Hazmat Suit (Used) (UST)': new DeckCard({quantity: 1, name: 'Hazmat Suit (Used)', set: 'UST'}),
            '1 Hazmat Suit (Used) 123': new DeckCard({quantity: 1, name: 'Hazmat Suit', set: 'USED', collector_number: '123'}),
            '1 Hazmat Suit (Used:123)': new DeckCard({quantity: 1, name: 'Hazmat Suit', set: 'USED', collector_number: '123'}),
            '17-Year Cicadas': new DeckCard({name: '17-Year Cicadas'}),
            '17 Year Cicadas': new DeckCard({quantity: 17, name: 'Year Cicadas'}),
            '3 17-Year Cicadas': new DeckCard({quantity: 3, name: '17-Year Cicadas'}),
            '1996 World Champion': new DeckCard({name: '1996 World Champion'}),
            '100 1996 World Champion': new DeckCard({quantity: 100, name: '1996 World Champion'}),
            '70,000 Light-Years from Home': new DeckCard({name: '70,000 Light-Years from Home'}),
            '+2 mace': new DeckCard({name: '+2 mace'}),
            '_____': new DeckCard({name: '_____'}),
            '______': new DeckCard({name: '______'}),
            '_____ Goblin': new DeckCard({name: '_____ Goblin'}),
            '"Ach! Hans, Run!"': new DeckCard({name: '"Ach! Hans, Run!"'}),
            'Éomer, King of Rohan': new DeckCard({name: 'Éomer, King of Rohan'}),
            '1 Sheoldred, Whispering One (PNPH) 73★ *F*': new DeckCard({quantity: 1, name: 'Sheoldred, Whispering One', set: 'PNPH', collector_number: '73★', finish: Finish.foil}),
        }).forEach(([input, expected]) => {
            const card = DeckCard.parse(input);

            this.assert_match(
                expected,
                card,
                `Input "${input}" matched expected fields`,
                `Input "${input}" did not match expected fields`,
            );

            if (card) {
                const card2 = DeckCard.parse(card.to_string('1 Name (SET:000?)? *EN*? *F*? *NM*? [Tag] #Board'));

                this.assert_match(
                    expected,
                    card2,
                    `Reparsing card did not change it`,
                    `Reparsing card changed it`,
                );
            }
        });
    }
}
