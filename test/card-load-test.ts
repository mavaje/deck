import {DeckCard} from "../deck-card";
import {Test, TestValue} from "./test";

export class CardLoadTest extends Test {

    protected pass_message: string = 'Passed all {count} card loading tests';
    protected fail_message: string = 'Passed {passes}/{count} card loading tests (failed {fails})';

    async test(): Promise<void> {
        await Promise.all(Object.entries({
            'forest': {
                name: 'Forest',
                set: null,
                collector_number: null,
                card: {oracle_id: 'b34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6'},
            },
            'forest *FR*': {
                name: 'Forest',
                card: {oracle_id: 'b34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6', lang: 'en', printed_name: undefined},
                card_lang: {oracle_id: 'b34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6', lang: 'fr', printed_name: 'Forêt'},
            },
            'forest (KTK)': {
                set: 'KTK',
                card: {oracle_id: 'b34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6', set: 'ktk'},
            },
            'forest (KTK) *FR*': {
                set: 'KTK',
                card: {oracle_id: 'b34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6', set: 'ktk', lang: 'en'},
                card_lang: {oracle_id: 'b34bb2dc-c1af-4d77-b0b3-a0fb342a5fc6', set: 'ktk', lang: 'fr'},
            },
            'forest (KTK:267)': {
                set: 'KTK',
                card: {id: '722111d4-99f4-463b-b232-96821c18f189'},
            },
            'forest (KTK:267) *FR*': {
                set: 'KTK',
                card: {id: '722111d4-99f4-463b-b232-96821c18f189'},
                card_lang: {id: '39ca107a-db70-4115-9d12-2f90a2778f2a'},
            },
            '+2 mace': {card: {oracle_id: '629fe1be-272d-465f-b9b1-2ce177410f13'}},
            '_____': {card: {oracle_id: '4e536142-4ebe-4062-887b-5dd123c41d39'}},
            '______': {card: {oracle_id: '571ccaf0-d2a0-46d3-af4b-14245a9a79ff'}},
            '______ (UNK)': {
                set: 'UNK',
                card: {oracle_id: '571ccaf0-d2a0-46d3-af4b-14245a9a79ff', set: 'unk'},
            },
            '______ (UNK:RL01c)': {
                set: 'UNK',
                collector_number: 'RL01c',
                card: {id: 'a505ba37-b131-48d2-a2d7-a340763343f8', set: 'unk'},
            },
            '_____ Goblin': {card: {oracle_id: '88222fd2-8316-426c-8218-64f6be5ca0f8'}},
            '"Ach! Hans, Run!"': {card: {oracle_id: 'a2c5ee76-6084-413c-bb70-45490d818374'}},
            'Éomer, King of Rohan': {card: {oracle_id: '4f8191e6-a6aa-4426-9014-eff4e0efee9e'}},
        } as Record<string, TestValue<DeckCard>>).map(async ([input, expected]) => {
            const card = await DeckCard.parse(input).load();

            this.assert_match(
                expected,
                card,
                `Input "${input}" matched expected fields`,
                `Input "${input}" did not match expected fields`,
            );

            const id = card.card.id;

            await card.reload();

            this.assert(
                id === card.card.id,
                `Reloading card did not change it`,
                `Reloading card changed it`,
            );
        }));
    }
}
