import {HTML} from "../xml";
import {DeckView} from "../deck-view";
import {Type} from "../../card-classifier/type";
import {Color} from "../../card-classifier/color";
import {ColorIdentity} from "../../card-classifier/color-identity";
import {ManaValue} from "../../card-classifier/mana-value";
import {SetClassifier} from "../../card-classifier/set-classifier";
import {Rarity} from "../../card-classifier/rarity";
import {Tag} from "../../card-classifier/tag";
import {Name} from "../../card-classifier/name";
import {PriceEUR, PriceTIX, PriceUSD} from "../../card-classifier/price";
import {RankEDHREC, RankPenny} from "../../card-classifier/rank";
import {CardClassifier} from "../../card-classifier/card-classifier";
import {Subtype} from "../../card-classifier/subtype";
import {Keyword} from "../../card-classifier/keyword";
import {Artist} from "../../card-classifier/artist";
import {TypePrimary} from "../../card-classifier/type-primary";
import {CardPanel} from "./card-panel";
import {Panel} from "../panel";
import {Deck} from "../../deck";
import {DeckCard} from "../../deck-card";
import {Dropdown} from "../dropdown";
import {EditDeckField} from "../../history/edit-deck-field";
import {Format} from "../../format";
import {Game} from "../../game";

export class DeckPanel extends Panel {
    static id: string = 'deck-panel';

    static CARD_GROUPINGS: (typeof CardClassifier<any>)[] = [
        CardClassifier,
        SetClassifier,
        Rarity,
        Type,
        TypePrimary,
        Subtype,
        Color,
        ColorIdentity,
        ManaValue,
        Artist,
        Keyword,
        Tag,
    ];

    static CARD_ORDERINGS: (typeof CardClassifier<any>)[] = [
        CardClassifier,
        Name,
        SetClassifier,
        Rarity,
        TypePrimary,
        Color,
        ColorIdentity,
        PriceUSD,
        PriceEUR,
        PriceTIX,
        ManaValue,
        RankEDHREC,
        RankPenny,
    ];

    static initialise() {
        HTML.button({
            id: 'deck-collapse',
            onclick: () => this.toggle(),
        });

        HTML.button({
            id: 'deck-upload',
            onclick: () => file_input.click(),
        });

        HTML.button({
            id: 'deck-download',
            onclick: () => {
                console.log(Deck.CURRENT.to_string());
                DeckCard.CACHE.dump();
            },
        });

        HTML.h2({
            id: 'deck-title',
            contenteditable: true,
            onblur: element => EditDeckField.do('title', element.innerText),
            onkeypress: (element, event) => {
                if (event.key === 'Enter') {
                    element.blur();
                    event.preventDefault();
                }
            },
        });

        const file_input = HTML.input({
            id: 'deck-file-input',
            oninput: input => {
                const file = input.files[0];
                const [title] = file.name.split('.');

                this.update();

                file.text()
                    .then(input => Deck.load_current(input, title))
                    .then(() => DeckCard.CACHE.dump());
            },
        });

        HTML.input({
            id: 'by-zone',
            onchange: input => {
                DeckView.BY_ZONE = input.checked;
                DeckView.render();
            },
        });

        new Dropdown(
            {
                id: 'group-by',
                value: DeckView.ORDERING.name,
                readonly: true,
            },
            ({value}) => {
                DeckView.GROUPING = value;
                DeckView.render();
            },
            this.CARD_GROUPINGS.map(grouping => ({
                label: grouping.name,
                value: grouping,
            })),
        );

        new Dropdown(
            {
                id: 'order-by',
                value: DeckView.ORDERING.name,
                readonly: true,
            },
            ({value}) => {
                DeckView.ORDERING = value;
                DeckView.render();
            },
            this.CARD_ORDERINGS.map(ordering => ({
                label: ordering.name,
                value: ordering,
            })),
        );

        new Dropdown(
            {
                id: 'deck-format',
                value: Deck.CURRENT.format?.name ?? '',
                readonly: true,
            },
            ({value}) => EditDeckField.do('format', value),
            [
                {
                    label: 'Unspecified',
                    input_value: '',
                    value: null,
                    discouraged: true,
                },
                ...Format.all().map(format => ({
                    label: format.name,
                    value: format,
                })),
            ],
        );

        new Dropdown(
            {
                id: 'deck-game',
                value: Deck.CURRENT.game?.name ?? '',
                readonly: true,
            },
            ({value}) => EditDeckField.do('game', value),
            [
                {
                    label: 'Unspecified',
                    input_value: '',
                    value: null,
                    discouraged: true,
                },
                ...Game.all().map(game => ({
                    label: game.name,
                    value: game,
                })),
            ],
        );
    }

    static update(): void {
        HTML.h2({id: 'deck-title'}, Deck.CURRENT.title);
        HTML.h2({id: 'deck-format', value: Deck.CURRENT.format?.name ?? ''});
        HTML.h2({id: 'deck-game', value: Deck.CURRENT.game?.name ?? ''});

        for (let i = 0; i < Deck.CURRENT.length; i++) {
            const url = Deck.CURRENT[i].display_face().face?.image_uris.art;
            if (url) {
                HTML.div({
                    id: 'background', style: {
                        '--card-image-url': `url(${url})`,
                    }
                });
                break;
            }
        }
    }

    static open(): void {
        if (window.innerWidth < 848) {
            CardPanel.close();
        }
        super.open();
        this.update();
    }
}
