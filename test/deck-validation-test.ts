import {Test, TestMatcher} from "./test";
import {Deck} from "../deck";
import {Format} from "../format";
import {DeckError, DeckValidator} from "../deck-validator";

export class DeckValidationTest extends Test {

    protected pass_message: string = 'Passed all {count} deck validation tests';
    protected fail_message: string = 'Passed {passes}/{count} deck validation tests (failed {fails})';

    async test(): Promise<void> {
        await Promise.all(([
            {
                format: Format.modern,
                input: `60 Forest`,
                errors: [],
            },
            {
                format: Format.commander,
                input: `
                    Borborygmos *CMDR*
                    Lightning Bolt
                    50 Mountain
                    48 Forest
                `,
                errors: [],
            },
            {
                format: Format.modern,
                input: `59 Forest`,
                errors: [
                    {type: 'too-few-cards'},
                ],
            },
            {
                format: Format.commander,
                input: `
                    Borborygmos *CMDR*
                    50 Mountain
                    48 Forest
                `,
                errors: [
                    {type: 'too-few-cards'},
                ],
            },
            {
                format: Format.commander,
                input: `
                    Borborygmos *CMDR*
                    50 Mountain
                    50 Forest
                `,
                errors: [
                    {type: 'too-many-cards'},
                ],
            },
            {
                format: Format.commander,
                input: `
                    Borborygmos *CMDR*
                    50 Mountain
                    49 Forest
                    #sideboard
                    Forest
                `,
                errors: [
                    {type: 'too-many-sideboard-cards'},
                ],
            },
            {
                format: Format.modern,
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
                format: Format.modern,
                input: `
                    Borborygmos *CMDR*
                    30 Mountain
                    29 Forest
                `,
                errors: [
                    {type: 'too-many-commanders'},
                ],
            },
            {
                format: Format.commander,
                input: `100 Forest`,
                errors: [
                    {type: 'too-few-commanders'},
                ],
            },
            {
                format: Format.commander,
                input: `
                    Borborygmos *CMDR*
                    Progenitus *CMDR*
                    98 Forest
                `,
                errors: [
                    {type: 'too-many-commanders'},
                ],
            },
            {
                format: Format.commander,
                input: `
                    Aclazotz, Deepest Betrayal *CMDR*
                    99 Swamp
                `,
                errors: [],
            },
            {
                format: Format.commander,
                input: `
                    Balamb Garden, SeeD Academy *CMDR*
                    50 Island
                    49 Forest
                `,
                errors: [
                    {type: 'illegal-commander'},
                ],
            },
            {
                format: Format.commander,
                input: `
                    # 2 Partners
                    Armix, Filigree Thrasher *CMDR*
                    Anara, Wolvid Familiar *CMDR*
                    49 Swamp
                    49 Forest
                `,
                errors: [],
            },
            {
                format: Format.commander,
                input: `
                    # Partner-with pair
                    Alisaie Leveilleur *CMDR*
                    Alphinaud Leveilleur *CMDR*
                    49 Plains
                    49 Island
                `,
                errors: [],
            },
            {
                format: Format.commander,
                input: `
                    # Invalid Partner-with pair
                    Alisaie Leveilleur *CMDR*
                    Bebop, Skull & Crossbones *CMDR*
                    49 Plains
                    49 Swamp
                `,
                errors: [
                    {type: 'too-many-commanders'},
                ],
            },
            {
                format: Format.commander,
                input: `
                    # Doctor's Companion pair
                    Amy Pond *CMDR*
                    The Eleventh Doctor *CMDR*
                    40 Plains
                    40 Island
                    18 Mountain
                `,
                errors: [],
            },
            {
                format: Format.commander,
                input: `
                    # Invalid trio
                    Amy Pond *CMDR*
                    Rory Williams *CMDR*
                    The Eleventh Doctor *CMDR*
                    40 Plains
                    40 Island
                    17 Mountain
                `,
                errors: [
                    {type: 'too-many-commanders'},
                ],
            },
            {
                format: Format.commander,
                input: `
                    # Background
                    Alora, Merry Thief *CMDR*
                    Folk Hero *CMDR*
                    49 Plains
                    49 Island
                `,
                errors: [],
            },
            {
                format: Format.commander,
                input: `
                    # Choose a color
                    Prismatic Piper *CMDR*
                    Armix, Filigree Thrasher *CMDR*
                    49 Swamp
                    49 Mountain
                `,
                errors: [],
            },
            {
                format: Format.commander,
                input: `
                    # Choose too many colors
                    Prismatic Piper *CMDR*
                    50 Swamp
                    49 Mountain
                `,
                errors: [
                    {type: 'color-identity-error'},
                ],
            },
            {
                format: Format.commander,
                input: `
                    # Invalid Commander
                    Wrenn and Six *CMDR*
                    50 Mountain
                    49 Forest
                `,
                errors: [
                    {type: 'illegal-commander'},
                ],
            },
            {
                format: Format.brawl,
                input: `
                    # Valid Brawler
                    Wrenn and Six *CMDR*
                    50 Mountain
                    49 Forest
                `,
                errors: [],
            },
            {
                format: Format.oathbreaker,
                input: `
                    # Valid Oathbreaker
                    Wrenn and Six *CMDR*
                    Cultivate *CMDR*
                    30 Mountain
                    28 Forest
                `,
                errors: [],
            },
            {
                format: Format.oathbreaker,
                input: `
                    # Missing signature spell
                    Wrenn and Six *CMDR*
                    30 Mountain
                    29 Forest
                `,
                errors: [
                    {type: 'too-few-commanders'},
                ],
            },
            {
                format: Format.oathbreaker,
                input: `
                    # 2 Oathbreakers
                    Wrenn and Six *CMDR*
                    Domri Rade *CMDR*
                    30 Mountain
                    28 Forest
                `,
                errors: [
                    {type: 'too-many-commanders'},
                ],
            },
            {
                format: Format.oathbreaker,
                input: `
                    # 2 signature spells
                    Cultivate *CMDR*
                    Rampant Growth *CMDR*
                    58 Forest
                `,
                errors: [
                    {type: 'too-many-commanders'},
                    {type: 'illegal-commander'},
                ],
            },
            {
                format: Format.oathbreaker,
                input: `
                    # Missing Oathbreaker
                    Cultivate *CMDR*
                    59 Forest
                `,
                errors: [
                    {type: 'too-few-commanders'},
                    {type: 'illegal-commander'},
                ],
            },
            {
                format: Format.oathbreaker,
                input: `
                    # Illegal Oathbreaker
                    Borborygmos *CMDR*
                    Cultivate *CMDR*
                    30 Mountain
                    28 Forest
                `,
                errors: [
                    {type: 'too-many-commanders'},
                    {type: 'illegal-commander'},
                ],
            },
            {
                format: Format.commander,
                input: `
                    Borborygmos *CMDR*
                    Black Lotus
                    50 Mountain
                    48 Forest
                `,
                errors: [
                    {type: 'illegal-card'},
                ],
            },
            {
                format: Format.commander,
                input: `
                    Borborygmos *CMDR*
                    2 Lightning Bolt
                    50 Mountain
                    47 Forest
                `,
                errors: [
                    {type: 'too-many-copies'},
                ],
            },
            {
                format: Format.modern,
                input: `
                    # Gyruda Companion - even mvs
                    Gyruda, Doom of Depths *CMPN*
                    Spark Double
                    Reflections of Littjara
                    30 Island
                    28 Swamp
                `,
                errors: [
                    {
                        type: 'companion-restriction-error',
                        cards: [{name: 'Reflections of Littjara'}],
                    },
                ],
            },
            {
                input: `
                    # Jegantha Companion - unique mana symbols
                    Jegantha, the Wellspring *CMPN*
                    Rhythm of the Wild
                    The Great Henge
                    Collision // Colossus
                    Fire // Ice
                    30 Forest
                    26 Mountain
                `,
                errors: [
                    {
                        type: 'companion-restriction-error',
                        cards: [
                            {name: 'The Great Henge'},
                            {name: 'Fire // Ice'},
                        ],
                    },
                ],
            },
            {
                input: `
                    # Kaheera Companion - kindred creatures
                    Kaheera, the Orphanguard *CMPN*
                    Etali, Primal Conqueror
                    Birds of Paradise
                    Changeling Outcast
                    30 Forest
                    28 Plains
                `,
                errors: [
                    {
                        type: 'companion-restriction-error',
                        cards: [{name: 'Birds of Paradise'}],
                    },
                ],
            },
            {
                input: `
                    # Keruga Companion - mvs >= 3
                    Keruga, the Macrosage *CMPN*
                    Cultivate
                    Rampant Growth
                    30 Forest
                    28 Island
                `,
                errors: [
                    {
                        type: 'companion-restriction-error',
                        cards: [{name: 'Rampant Growth'}],
                    },
                ],
            },
            {
                input: `
                    # Lurrus Companion - mvs <= 2
                    Lurrus of the Dream-Den *CMPN*
                    Arcane Signet
                    Rhystic Study
                    30 Plains
                    28 Swamp
                `,
                errors: [
                    {
                        type: 'companion-restriction-error',
                        cards: [{name: 'Rhystic Study'}],
                    },
                ],
            },
            {
                input: `
                    # Lutri Companion - unique cards
                    Lutri, the Spellchaser *CMPN*
                    Arcane Signet
                    2 Lightning Bolt
                    30 Island
                    28 Mountain
                `,
                errors: [
                    {
                        type: 'companion-restriction-error',
                        cards: [{name: 'Lightning Bolt'}],
                    },
                ],
            },
            {
                input: `
                    # Obosh Companion - odd mvs
                    Obosh, the Preypiercer *CMPN*
                    Arcane Signet
                    Cultivate
                    30 Swamp
                    28 Mountain
                `,
                errors: [
                    {
                        type: 'companion-restriction-error',
                        cards: [{name: 'Arcane Signet'}],
                    },
                ],
            },
            {
                input: `
                    # Umori Companion - shared card type
                    Umori, the Collector *CMPN*
                    Birds of Paradise
                    Solemn Simulacrum
                    Arcane Signet
                    30 Swamp
                    28 Forest
                `,
                errors: [
                    {
                        type: 'companion-restriction-error',
                        cards: [{name: 'Arcane Signet'}],
                    },
                ],
            },
            {
                format: Format.vintage,
                input: `
                    # Yorion Companion - deck size +20
                    Yorion, Sky Nomad *CMPN*
                    40 Island
                    39 Plains
                `,
                errors: [
                    {type: 'companion-restriction-error'},
                ],
            },
            {
                format: Format.vintage,
                input: `
                    # Yorion Companion - deck size +20
                    Yorion, Sky Nomad *CMPN*
                    40 Island
                    40 Plains
                `,
                errors: [],
            },
            {
                input: `
                    # Zirda Companion - abilities
                    Zirda, the Dawnwaker *CMPN*
                    Arcane Signet
                    Lightning Bolt
                    Rhythm of the Wild
                    30 Mountain
                    27 Plains
                `,
                errors: [
                    {
                        type: 'companion-restriction-error',
                        cards: [{name: 'Rhythm of the Wild'}],
                    },
                ],
            },
            {
                input: `
                    # Rulebreaker - any lands
                    Grizzlegom, Hurloon Hero *CMDR*
                    The World Tree
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    18 Forest
                `,
                errors: [],
            },
            {
                input: `
                    # Rulebreaker - any big creatures & any basic lands
                    Maular, the Next Evolution *CMDR*
                    Absolute Virtue
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    18 Forest
                `,
                errors: [],
            },
            {
                input: `
                    # Rulebreaker - any angels & any basic lands
                    Seluma, Light of Aysen *CMDR*
                    Angelic Captain
                    Changeling Outcast
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    17 Forest
                `,
                errors: [],
            },
            {
                input: `
                    # Rulebreaker - any artifact creatures, equipment, & any basic lands
                    The Everforger *CMDR*
                    Breya, Etherium Shaper
                    Mage Slayer
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    17 Forest
                `,
                errors: [],
            },
            {
                input: `
                    # Rulebreaker - any auras & any basic lands
                    The Unluckiest Planeswalker *CMDR*
                    Buried in the Garden
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    18 Forest
                `,
                errors: [],
            },
            {
                input: `
                    # Rulebreaker - any phyrexians & any basic lands
                    Valko Indorian *CMDR*
                    Atraxa, Praetors' Voice
                    Realmwalker
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    17 Forest
                `,
                errors: [],
            },
            {
                input: `
                    # Rulebreaker - spells +1 id
                    Tolabow, Loch Rascal *CMDR*
                    Lightning Bolt
                    Beacon Bolt
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    17 Forest
                `,
                errors: [],
            },
            {
                input: `
                    # Rulebreaker - spells +1 id
                    Tolabow, Loch Rascal *CMDR*
                    Cultivate
                    Beacon Bolt
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    17 Forest
                `,
                errors: [
                    {type: 'color-identity-error'},
                ],
            },
            {
                input: `
                    # Rulebreaker - spells +1 id
                    Tolabow, Loch Rascal *CMDR*
                    Cultivate
                    Beacon Bolt
                    20 Plains
                    20 Island
                    20 Swamp
                    20 Mountain
                    17 Forest
                `,
                errors: [
                    {type: 'color-identity-error'},
                ],
            },
            {
                input: `
                    # Rulebreaker - no max size
                    Whtz, the Bibliophile *CMDR*
                    100 Plains
                    100 Island
                `,
                errors: [],
            },
            {
                input: `
                    # Planar deck
                    Bant
                    Esper
                    Grixis
                    Jund
                    Naya
                    Agyrem
                    Akoum
                    Gavony
                    Chaotic Aether
                    Morphic Tide
                `,
                errors: [],
            },
            {
                input: `
                    # Planar deck
                    Bant
                    Esper
                    Grixis
                    Jund
                    Naya
                    Agyrem
                    Akoum
                    Chaotic Aether
                    Morphic Tide
                `,
                errors: [
                    {type: 'too-few-cards'},
                ],
            },
            {
                input: `
                    # Planar deck
                    Bant
                    Esper
                    Grixis
                    Jund
                    Naya
                    Agyrem
                    Akoum
                    Chaotic Aether
                    Morphic Tide
                    Planewide Disaster
                `,
                errors: [
                    {type: 'planar-deck-error'},
                ],
            },
            {
                input: `
                    # Planar deck
                    2 Bant
                    Esper
                    Grixis
                    Jund
                    Naya
                    Agyrem
                    Akoum
                    Chaotic Aether
                    Morphic Tide
                `,
                errors: [
                    {type: 'too-many-copies'},
                ],
            },
        ] as {
            format?: Format,
            input: string,
            errors: TestMatcher<DeckError[]>,
        }[]).map(async ({format, input, errors}) => {
            input = input.replaceAll(/^\s*|\s*$/g, '');

            const deck = Deck.parse(input);
            deck.format = format;

            await deck.load();

            const validator = new DeckValidator(deck);

            this.assert_match(
                errors,
                validator.validate(),
                `Input "${input}" matched expected validation`,
                `Input "${input}" did not match expected validation`,
            )
        }));
    }
}
