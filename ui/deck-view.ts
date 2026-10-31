import {HTML} from "../html";
import {Board} from "../designation/board";
import {Deck} from "../deck";
import {contrast} from "../color";
import {CardList} from "../card-list";
import {CardView} from "./card-view";
import {CardGrouping} from "../card-sorting/card-grouping";
import {NONE} from "../card-sorting/none";
import {CardOrdering} from "../card-sorting/card-ordering";

export class DeckView {

    static BY_BOARD: boolean = true;
    static GROUPING: CardGrouping = NONE;
    static ORDERING: CardOrdering = NONE;

    static render(deck: Deck = Deck.current): HTMLDivElement {
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
                ...this.GROUPING.groups(deck)
                    .map((group, j) => {
                        const group_cards = cards
                            .filter(card => this.GROUPING.test(card, group));
                        if (group_cards.cards.length === 0) return null;
                        return HTML.div(
                            {id: `group-${i}-${j}`, class: ['group', group.name]},
                            HTML.div({class: 'header'}, HTML.span({class: 'label', style: group.color && {
                                    background: `linear-gradient(to right in oklab, ${group.color.join(',')})`,
                                    color: contrast(...group.color),
                                }}, HTML.span({style: {font_weight: 'bold'}}, group.name), ` (${group_cards.count()})`)),
                            ...group_cards
                                .sort(DeckView.ORDERING)
                                .each((card, k) => {
                                rendered_cards.add(card);
                                return CardView.render(card, k < group_cards.cards.length - 1);
                            }),
                        );
                    }),
                (other = cards.filter(card => !rendered_cards.has(card))).cards.length > 0
                    ? HTML.div(
                        {id: `group-${i}-other`, class: 'group'},
                        this.GROUPING.remainder_group_name &&
                            HTML.div({class: 'header'}, HTML.span({class: 'label'}, HTML.span({style: {font_weight: 'bold'}}, this.GROUPING.remainder_group_name), ` (${other.count()})`)),
                        ...other
                            .sort(DeckView.ORDERING)
                            .each((card, k) => CardView.render(card, k < other.cards.length - 1)),
                    )
                    : null,
            ),
        );
    }
}
