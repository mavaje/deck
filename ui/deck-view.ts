import {HTML} from "../html";
import {Board} from "../designation/board";
import {Deck} from "../deck";
import {contrast} from "../color";
import {CardList} from "../card-list";
import {CardView} from "./card-view";
import {DeckCard} from "../deck-card";
import {CardClassifier} from "../card-classifier/card-classifier";

export class DeckView {

    static BY_BOARD: boolean = true;
    static GROUPING: typeof CardClassifier = CardClassifier;
    static ORDERING: typeof CardClassifier = CardClassifier;

    static render(deck: Deck = Deck.current): HTMLDivElement {
        for (let i = 0; i < deck.cards.length; i++) {
            if (this.set_background(deck.cards[i])) break;
        }
        const show_boards = this.BY_BOARD
            && deck.cards.some(card => !card.board.is_default());
        return HTML.div(
            {id: 'deck'},
            HTML.div(
                {class: 'groups'},
                show_boards
                    ? Board.all().map(board => this.render_board(deck, board))
                    : [this.render_board(deck)],
            ),
        );
    }

    private static render_board(deck: Deck, board: Board = null): HTMLDivElement {
        const grouping = new (this.GROUPING as any)(deck) as CardClassifier;
        const ordering = new (this.ORDERING as any)(deck) as CardClassifier;
        const i = (board ?? Board.DEFAULT).code();
        const cards = board
            ? deck.board(board)
            : deck;
        if (cards.cards.length === 0) return null;
        const rendered_cards = new Set();
        let other: CardList = null;
        return HTML.div(
            {id: `board-${i}`, class: 'group'},
            board && HTML.div({class: 'header'}, HTML.span({class: 'label'}, HTML.span({style: {font_weight: 'bold'}}, board.name), ` (${cards.count()})`)),
            HTML.div(
                {class: 'groups'},
                ...grouping.groups()
                    .map((group, j) => {
                        if (!group.cards || group.cards.cards.length === 0) return null;
                        return HTML.div(
                            {id: `group-${i}-${j}`, class: ['group', group.name]},
                            HTML.div({class: 'header'}, HTML.div({class: 'label', style: group.color && {
                                    background: `linear-gradient(to right in oklab, ${group.color.join(',')})`,
                                    color: contrast(...group.color),
                                }}, HTML.div({style: {font_weight: 'bold'}}, group.name), ` (${group.cards.count()})`)),
                            ...group.cards
                                .sort((a, b) => ordering.compare(a, b))
                                .each((card, k) => {
                                rendered_cards.add(card);
                                return CardView.render(card, k < group.cards.cards.length - 1);
                            }),
                        );
                    }),
                (other = cards.filter(card => !rendered_cards.has(card))).cards.length > 0
                    ? HTML.div(
                        {id: `group-${i}-other`, class: 'group'},
                        this.GROUPING.ungrouped_name &&
                            HTML.div({class: 'header'}, HTML.div({class: 'label'}, HTML.div({style: {font_weight: 'bold'}}, this.GROUPING.ungrouped_name), ` (${other.count()})`)),
                        ...other
                            .sort((a, b) => ordering.compare(a, b))
                            .each((card, k) => CardView.render(card, k < other.cards.length - 1)),
                    )
                    : null,
            ),
        );
    }

    static set_background(card: DeckCard): boolean {
        const url = card.main_face().face?.image_uris.art;
        if (url) {
            HTML.div({
                id: 'card-image', style: {
                    background_image: `url(${url})`,
                }
            });
            return true;
        }
        return false;
    }
}
