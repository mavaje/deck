import {Test, TestMatcher} from "./test";
import {Deck} from "../deck";
import {match_format} from "../format";
import {DeckError, validate} from "../deck-error";

export class DeckValidationTest extends Test {

    protected pass_message: string = 'Passed all {count} deck validation tests';
    protected fail_message: string = 'Passed {passes}/{count} deck validation tests (failed {fails})';

    async test(): Promise<void> {
        await Promise.all(([
            {
                format: 'modern',
                input: `60 Forest`,
                errors: [],
            },
            {
                format: 'commander',
                input: `
                    1 Borborygmos *CMDR*
                    1 Lightning Bolt
                    50 Mountain
                    48 Forest
                `,
                errors: [],
            },
            {
                format: 'modern',
                input: `59 Forest`,
                errors: [
                    {type: 'too-few-cards'},
                ],
            },
            {
                format: 'commander',
                input: `
                    1 Borborygmos *CMDR*
                    50 Mountain
                    48 Forest
                `,
                errors: [
                    {type: 'too-few-cards'},
                ],
            },
            {
                format: 'commander',
                input: `
                    1 Borborygmos *CMDR*
                    50 Mountain
                    50 Forest
                `,
                errors: [
                    {type: 'too-many-cards'},
                ],
            },
            {
                format: 'commander',
                input: `
                    1 Borborygmos *CMDR*
                    50 Mountain
                    49 Forest
                    #sideboard
                    1 Forest
                `,
                errors: [
                    {type: 'too-many-sideboard-cards'},
                ],
            },
            {
                format: 'modern',
                input: `
                    60 Forest
                    #sideboard
                    16 Forest
                `,
                errors: [
                    {type: 'too-many-sideboard-cards'},
                ],
            },
            {
                format: 'modern',
                input: `
                    1 Borborygmos *CMDR*
                    30 Mountain
                    29 Forest
                `,
                errors: [
                    {type: 'too-many-commanders'},
                ],
            },
            {
                format: 'commander',
                input: `100 Forest`,
                errors: [
                    {type: 'too-few-commanders'},
                ],
            },
            {
                format: 'commander',
                input: `
                    1 Borborygmos *CMDR*
                    1 Progenitus *CMDR*
                    98 Forest
                `,
                errors: [
                    {type: 'too-many-commanders'},
                ],
            },
            {
                format: 'commander',
                input: `
                    # 2 Partners
                    1 Armix, Filigree Thrasher *CMDR*
                    1 Anara, Wolvid Familiar *CMDR*
                    49 Swamp
                    49 Forest
                `,
                errors: [],
            },
            {
                format: 'commander',
                input: `
                    # Partner-with pair
                    1 Alisaie Leveilleur *CMDR*
                    1 Alphinaud Leveilleur *CMDR*
                    49 Plains
                    49 Island
                `,
                errors: [],
            },
            {
                format: 'commander',
                input: `
                    # Invalid Partner-with pair
                    1 Alisaie Leveilleur *CMDR*
                    1 Bebop, Skull & Crossbones *CMDR*
                    49 Plains
                    49 Swamp
                `,
                errors: [
                    {type: 'too-many-commanders'},
                ],
            },
            {
                format: 'commander',
                input: `
                    # Doctor's Companion pair
                    1 Amy Pond *CMDR*
                    1 The Eleventh Doctor *CMDR*
                    40 Plains
                    40 Island
                    18 Mountain
                `,
                errors: [],
            },
            {
                format: 'commander',
                input: `
                    # Invalid trio
                    1 Amy Pond *CMDR*
                    1 Rory Williams *CMDR*
                    1 The Eleventh Doctor *CMDR*
                    40 Plains
                    40 Island
                    17 Mountain
                `,
                errors: [
                    {type: 'too-many-commanders'},
                ],
            },
            {
                format: 'commander',
                input: `
                    # Background
                    1 Alora, Merry Thief *CMDR*
                    1 Folk Hero *CMDR*
                    49 Plains
                    49 Island
                `,
                errors: [],
            },
            {
                format: 'commander',
                input: `
                    # Choose a color
                    1 Prismatic Piper *CMDR*
                    1 Armix, Filigree Thrasher *CMDR*
                    49 Swamp
                    49 Mountain
                `,
                errors: [],
            },
            {
                format: 'commander',
                input: `
                    # Choose too many colors
                    1 Prismatic Piper *CMDR*
                    50 Swamp
                    49 Mountain
                `,
                errors: [
                    {type: 'color-identity-error'},
                ],
            },
            {
                format: 'commander',
                input: `
                    # Invalid Commander
                    1 Wrenn and Six *CMDR*
                    50 Mountain
                    49 Forest
                `,
                errors: [
                    {type: 'illegal-commander'},
                ],
            },
            {
                format: 'brawl',
                input: `
                    # Valid Brawler
                    1 Wrenn and Six *CMDR*
                    50 Mountain
                    49 Forest
                `,
                errors: [],
            },
            {
                format: 'oathbreaker',
                input: `
                    # Valid Oathbreaker
                    1 Wrenn and Six *CMDR*
                    1 Cultivate *CMDR*
                    30 Mountain
                    28 Forest
                `,
                errors: [],
            },
            {
                format: 'oathbreaker',
                input: `
                    # Missing signature spell
                    1 Wrenn and Six *CMDR*
                    30 Mountain
                    29 Forest
                `,
                errors: [
                    {type: 'too-few-commanders'},
                ],
            },
            {
                format: 'oathbreaker',
                input: `
                    # 2 Oathbreakers
                    1 Wrenn and Six *CMDR*
                    1 Domri Rade *CMDR*
                    30 Mountain
                    28 Forest
                `,
                errors: [
                    {type: 'too-many-commanders'},
                ],
            },
            {
                format: 'oathbreaker',
                input: `
                    # 2 signature spells
                    1 Cultivate *CMDR*
                    1 Rampant Growth *CMDR*
                    58 Forest
                `,
                errors: [
                    {type: 'too-many-commanders'},
                    {type: 'illegal-commander'},
                ],
            },
            {
                format: 'oathbreaker',
                input: `
                    # Missing Oathbreaker
                    1 Cultivate *CMDR*
                    59 Forest
                `,
                errors: [
                    {type: 'too-few-commanders'},
                    {type: 'illegal-commander'},
                ],
            },
            {
                format: 'oathbreaker',
                input: `
                    # Illegal Oathbreaker
                    1 Borborygmos *CMDR*
                    1 Cultivate *CMDR*
                    30 Mountain
                    28 Forest
                `,
                errors: [
                    {type: 'too-many-commanders'},
                    {type: 'illegal-commander'},
                ],
            },
            {
                format: 'commander',
                input: `
                    1 Borborygmos *CMDR*
                    1 Black Lotus
                    50 Mountain
                    48 Forest
                `,
                errors: [
                    {type: 'illegal-card'},
                ],
            },
            {
                format: 'commander',
                input: `
                    1 Borborygmos *CMDR*
                    2 Lightning Bolt
                    50 Mountain
                    47 Forest
                `,
                errors: [
                    {type: 'too-many-copies'},
                ],
            },
            {
                format: 'commander',
                input: `
                    # Rulebreaker - any lands
                    1 Grizzlegom, Hurloon Hero *CMDR*
                    1 The World Tree
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    18 Forest
                `,
                errors: [
                    {type: 'illegal-card'},
                ],
            },
            {
                format: 'commander',
                input: `
                    # Rulebreaker - any big creatures & any basic lands
                    1 Maular, the Next Evolution *CMDR*
                    1 Absolute Virtue
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    18 Forest
                `,
                errors: [
                    {type: 'illegal-card'},
                ],
            },
            {
                format: 'commander',
                input: `
                    # Rulebreaker - any angels & any basic lands
                    1 Seluma, Light of Aysen *CMDR*
                    1 Angelic Captain
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    18 Forest
                `,
                errors: [
                    {type: 'illegal-card'},
                ],
            },
            {
                format: 'commander',
                input: `
                    # Rulebreaker - any artifact creatures, equipment, & any basic lands
                    1 The Everforger *CMDR*
                    1 Breya, Etherium Shaper
                    1 Mage Slayer
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    17 Forest
                `,
                errors: [
                    {type: 'illegal-card'},
                ],
            },
            {
                format: 'commander',
                input: `
                    # Rulebreaker - any auras & any basic lands
                    1 The Unluckiest Planeswalker *CMDR*
                    1 Buried in the Garden
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    18 Forest
                `,
                errors: [
                    {type: 'illegal-card'},
                ],
            },
            {
                format: 'commander',
                input: `
                    # Rulebreaker - any phyrexians & any basic lands
                    1 Valko Indorian *CMDR*
                    1 Atraxa, Praetors' Voice
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    18 Forest
                `,
                errors: [
                    {type: 'illegal-card'},
                ],
            },
            {
                format: 'commander',
                input: `
                    # Rulebreaker - spells +1 id
                    1 Tolabow, Loch Rascal *CMDR*
                    1 Lightning Bolt
                    1 Beacon Bolt
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    17 Forest
                `,
                errors: [
                    {type: 'illegal-card'},
                ],
            },
            {
                format: 'commander',
                input: `
                    # Rulebreaker - spells +1 id
                    1 Tolabow, Loch Rascal *CMDR*
                    1 Cultivate
                    1 Beacon Bolt
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    17 Forest
                `,
                errors: [
                    {type: 'illegal-card'},
                    {type: 'color-identity-error'},
                ],
            },
            {
                format: 'commander',
                input: `
                    # Rulebreaker - spells +1 id
                    1 Tolabow, Loch Rascal *CMDR*
                    1 Cultivate
                    1 Beacon Bolt
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    17 Forest
                `,
                errors: [
                    {type: 'illegal-card'},
                    {type: 'color-identity-error'},
                ],
            },
            {
                format: 'commander',
                input: `
                    # Rulebreaker - no max size
                    1 Whtz, the Bibliophile *CMDR*
                    100 Plains
                    100 Island
                `,
                errors: [
                    {type: 'illegal-card'},
                ],
            },
            {
                format: 'commander',
                input: `
                    # With Planar deck
                    1 Borborygmos *CMDR*
                    50 Mountain
                    49 Forest
                    
                    # Planar deck
                    1 Bant
                    1 Esper
                    1 Grixis
                    1 Jund
                    1 Naya
                    1 Agyrem
                    1 Akoum
                    1 Gavony
                    1 Chaotic Aether
                    1 Morphic Tide
                `,
                errors: [],
            },
            {
                format: 'commander',
                input: `
                    # Too small Planar deck
                    1 Borborygmos *CMDR*
                    50 Mountain
                    49 Forest
                    
                    # Planar deck
                    1 Bant
                    1 Esper
                    1 Grixis
                    1 Jund
                    1 Naya
                    1 Agyrem
                    1 Akoum
                    1 Chaotic Aether
                    1 Morphic Tide
                `,
                errors: [
                    {type: 'too-few-cards'},
                ],
            },
            {
                format: 'commander',
                input: `
                    # Too many phenomena
                    1 Borborygmos *CMDR*
                    50 Mountain
                    49 Forest
                    
                    # Planar deck
                    1 Bant
                    1 Esper
                    1 Grixis
                    1 Jund
                    1 Naya
                    1 Agyrem
                    1 Akoum
                    1 Chaotic Aether
                    1 Morphic Tide
                    1 Planewide Disaster
                `,
                errors: [
                    {type: 'planar-deck-error'},
                ],
            },
            {
                format: 'commander',
                input: `
                    # Duplicate planar card
                    1 Borborygmos *CMDR*
                    50 Mountain
                    49 Forest
                    
                    # Planar deck
                    2 Bant
                    1 Esper
                    1 Grixis
                    1 Jund
                    1 Naya
                    1 Agyrem
                    1 Akoum
                    1 Chaotic Aether
                    1 Morphic Tide
                `,
                errors: [
                    {type: 'too-many-copies'},
                ],
            },
        ] as {
            format: string,
            input: string,
            errors: TestMatcher<DeckError[]>,
        }[]).map(async ({format, input, errors}) => {
            input = input.replaceAll(/^\s*|\s*$/g, '');

            const deck = Deck.parse(input);
            deck.format = match_format(format);

            await deck.load();

            this.assert_match(
                errors,
                validate(deck),
                `Input "${input}" matched expected validation`,
                `Input "${input}" did not match expected validation`,
            )
        }));
    }
}
