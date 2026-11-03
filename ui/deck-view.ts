import {HTML} from "../html";
import {Board} from "../designation/board";
import {Deck} from "../deck";
import {contrast} from "../color";
import {CardView} from "./card-view";
import {DeckCard} from "../deck-card";
import {CardClassifier, Group} from "../card-classifier/card-classifier";
import {CardList} from "../card-list";

export class DeckView {

    static BY_BOARD: boolean = true;
    static GROUPING: typeof CardClassifier = CardClassifier;
    static ORDERING: typeof CardClassifier = CardClassifier;

    static rendered_cards: WeakMap<DeckCard, HTMLDivElement[]> = new WeakMap();

    static render(deck: Deck = Deck.current): HTMLDivElement {
        this.rendered_cards = new WeakMap();

        const show_boards = this.BY_BOARD
            && deck.some(card => !card.board.is_default());

        return HTML.div(
            {id: 'deck'},
            HTML.div(
                {class: 'groups'},
                show_boards
                    ? Board.all()
                        .map(board => this.render_board(deck.board(board), board))
                    : [this.render_board(deck.filter(() => true))],
            ),
        );
    }

    private static render_board(cards: CardList, board?: Board): HTMLDivElement {
        const grouping = new (this.GROUPING as any)(cards) as CardClassifier;
        if (cards.length === 0) return null;
        return HTML.div(
            {class: 'group'},
            board && HTML.div({class: 'header'}, HTML.span({class: 'label'}, HTML.span({style: {font_weight: 'bold'}}, board.name), ` (${cards.count()})`)),
            HTML.div(
                {class: 'groups'},
                ...grouping.groups()
                    .map(group => this.render_group(group)),
                this.render_group({
                    name: this.GROUPING.ungrouped_name,
                    cards: cards.filter(card => !this.rendered_cards.has(card)),
                }),
            ),
        );
    }

    static render_group(
        group: Group,
    ): HTMLDivElement {
        if (!(group?.cards?.length > 0)) return null;
        const ordering = new (this.ORDERING as any)() as CardClassifier;
        return HTML.div(
            {class: ['group']},
            group.name && HTML.div({class: 'header'}, HTML.div({class: 'label', style: group.color && {
                    background: `linear-gradient(to right in oklab, ${group.color.join(',')})`,
                    color: contrast(...group.color),
                }}, HTML.div({style: {font_weight: 'bold'}}, group.name), ` (${group.cards.count()})`)),
            ...group.cards
                .sort((a, b) => ordering.compare(a, b))
                .flatMap((card, i, cards) => {
                    const last_deck_card = i === cards.length - 1;
                    const elements: HTMLDivElement[] = [];

                    for (let j = 0; j < card.quantity; j++) {
                        const last_of_card = j === card.quantity - 1;
                        elements.push(CardView.render(card, j, last_deck_card && last_of_card));
                    }

                    const all_elements = this.rendered_cards.get(card) ?? [];
                    all_elements.push(...elements);
                    this.rendered_cards.set(card, all_elements);

                    return elements;
                }),
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
