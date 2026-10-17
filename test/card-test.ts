import {DeckCard} from "../deck-card";
import {assert} from "./assert";

export function test_card_parsing() {
    Object.entries({
        'forest': {quantity: 1, name: 'forest'},
        '1 forest': {quantity: 1, name: 'forest'},
        '3 forest': {quantity: 3, name: 'forest'},
        '3x forest': {quantity: 3, name: 'forest'},
        '0 forest': {quantity: 0, name: 'forest'},
        '0x forest': {quantity: 0, name: 'forest'},
        '4 Aurelia, Exemplar of Justice (GRN) 153': {quantity: 4, name: 'Aurelia, Exemplar of Justice', set: 'grn', collector_number: '153'},
        '4x Aurelia, Exemplar of Justice (GRN) 153': {quantity: 4, name: 'Aurelia, Exemplar of Justice', set: 'grn', collector_number: '153'},
        'Aurelia, Exemplar of Justice (GRN) 153': {quantity: 1, name: 'Aurelia, Exemplar of Justice', set: 'grn', collector_number: '153'},
        '4 Aurelia, Exemplar of Justice (GRN:153)': {quantity: 4, name: 'Aurelia, Exemplar of Justice', set: 'grn', collector_number: '153'},
        '1 Demonlord Belzenlok (DAR) 86': {quantity: 1, name: 'Demonlord Belzenlok', set: 'dar', collector_number: '86'},
        '24 Mountain': {quantity: 24, name: 'Mountain'},
        '1 Shock': {quantity: 1, name: 'Shock'},
        '1x Llanowar Elves (M10)': {quantity: 1, name: 'Llanowar Elves', set: 'm10'},
        '1x Greven Il Vec *CMDR*': {quantity: 1, name: 'Greven Il Vec', is_commander: true},
        '1x Gyruda, Doom of Depths *CMPN*': {quantity: 1, name: 'Gyruda, Doom of Depths', is_companion: true},
        '1x Mishra\'s Factory (ATQ:1074)': {quantity: 1, name: 'Mishra\'s Factory', set: 'atq', collector_number: '1074'},
        '1x Llanowar Elves *GE*': {quantity: 1, name: 'Llanowar Elves', language: 'de'},
        '1x Llanowar Elves (M10) *F* *IT*': {quantity: 1, name: 'Llanowar Elves', set: 'm10', is_foil: true, language: 'it'},
        '1x Island #Land': {quantity: 1, name: 'Island', tags: ['Land']},
        '2 Sensei\'s Divining Top': {quantity: 2, name: 'Sensei\'s Divining Top'},
        '2x Sol Ring': {quantity: 2, name: 'Sol Ring'},
        '1x Path to Exile (cmm) [Removal] ^To Remove,#FF0000^': {quantity: 1, name: 'Path to Exile', set: 'cmm', tags: ['Removal', 'To Remove']},
        '1 Wrath of God': {quantity: 1, name: 'Wrath of God'},
        '2 Island': {quantity: 2, name: 'Island'},
        '1 Forest': {quantity: 1, name: 'Forest'},
        '1 Hazmat Suit (Used)': {quantity: 1, name: 'Hazmat Suit (Used)'},
        '1 Hazmat Suit (Used) (UST)': {quantity: 1, name: 'Hazmat Suit (Used)', set: 'ust'},
        '17-Year Cicadas': {quantity: 1, name: '17-Year Cicadas'},
        '3 17-Year Cicadas': {quantity: 3, name: '17-Year Cicadas'},
        '1996 World Champion': {quantity: 1, name: '1996 World Champion'},
        '100 1996 World Champion': {quantity: 100, name: '1996 World Champion'},
    } as Record<string, Partial<DeckCard>>).forEach(([input, expected]) => {
        const card = DeckCard.parse(input);

        const fields = Object.entries(expected);
        const matches = fields.map(([key, value]) =>
            key === 'tags'
                ? card.tags.length === (value as string[]).length && card.tags.every(tag => (value as string[]).includes(tag))
                : card[key] === value
        );

        assert(
            matches.every(Boolean),
            `Input "${input}" matched expected fields`,
            `Input "${input}" did not match expected fields`,
            matches.map((pass, i) =>
                [
                    pass,
                    fields[i].join(': '),
                    `${fields[i][0]}: ${card[fields[i][0]]} != ${fields[i][1]}`,
                ]
            )
        );
    });
}
