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

export class DeckPanel extends Panel {
    static id: string = 'deck-panel';

    static CARD_GROUPINGS: (typeof CardClassifier<string | number>)[] = [
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

    static CARD_ORDERINGS: (typeof CardClassifier<string | number>)[] = [
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
            },
        });

        HTML.h2({
            id: 'deck-title',
            contenteditable: true,
            onchange: element => {
                Deck.CURRENT.title = element.innerText;
            },
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

                HTML.h2({id: 'deck-title'}, title);

                file.text()
                    .then(input => Deck.load_current(input, title))
                    .then(() => DeckCard.CACHE.dump());
            },
        });

        HTML.select({
            id: 'group-by',
            onchange: select => {
                DeckView.GROUPING = this.CARD_GROUPINGS[select.value];
                DeckView.render();
            },
        }, this.CARD_GROUPINGS.map((grouping, i) =>
            HTML.option({value: i}, grouping.name)));

        HTML.input({
            id: 'by-zone',
            onchange: input => {
                DeckView.BY_ZONE = input.checked;
                DeckView.render();
            },
        });

        HTML.select({
            id: 'order-by',
            onchange: select => {
                DeckView.ORDERING = this.CARD_ORDERINGS[select.value];
                DeckView.render();
            },
        }, this.CARD_ORDERINGS.map((ordering, i) =>
            HTML.option({value: i}, ordering.name)));
    }

    static open(): void {
        if (window.innerWidth < 848) {
            CardPanel.close();
        }
        super.open();
    }
}
