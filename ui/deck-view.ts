import {HTML} from "./html";
import {Board} from "../designation/board";
import {Deck} from "../deck";
import {blend, contrast} from "../color";
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
                {id: 'deck-groups', class: 'groups'},
                show_boards
                    ? Board.all()
                        .map(board => this.render_board(deck.board(board), board))
                    : [this.render_board(deck.copy())],
            ),
        );
    }

    private static render_board(
        cards: CardList,
        board?: Board,
    ): HTMLDivElement {
        const grouping = new (this.GROUPING as any)(cards) as CardClassifier;
        if (cards.length === 0) return null;
        const id = `board-${board ?? 'all'}`;
        return HTML.div(
            {
                id,
                class: 'group',
            },
            board && HTML.div({
                id: `${id}-label`,
                class: ['label', 'dark'],
            }, HTML.div(
                HTML.span({style: {font_weight: 'bold'}}, board.name),
                ` (${cards.count()})`,
            )),
            HTML.div(
                {
                    id: `${id}-groups`,
                    class: 'groups',
                },
                ...grouping.groups()
                    .map((group, j) => this.render_group(group, `${id}-group-${j}`, grouping)),
                this.render_group({
                    name: this.GROUPING.ungrouped_name,
                    cards: cards.filter(card => !this.rendered_cards.has(card)),
                }, `${id}-ungrouped`),
            ),
        );
    }

    static render_group(
        group: Group,
        id: string | number = 0,
        grouping?: CardClassifier,
    ): HTMLDivElement {
        if (!group) return null;
        let cards: CardList = null;
        let groups: Group[] = null;
        let count: number;
        if ('cards' in group) {
            cards = group.cards.copy();
            count = cards.count();
        } else {
            groups = group.groups;
            count = group.count;
        }
        if (!cards?.length && !groups?.length) return null;
        const ordering = new (this.ORDERING as any)() as CardClassifier;
        return HTML.div(
            {
                id,
                class: ['group'],
            },
            group.name && HTML.div(
                {
                    id: `${id}-label`,
                    class: [
                        'label',
                        group.color && contrast(group.color.length > 1 ? blend(
                            group.color[0],
                            group.color[0],
                            group.color[1],
                        ) : group.color[0])
                            ? 'light'
                            : 'dark',
                    ],
                    style: {
                        background: group.color && `linear-gradient(to right in ${group.color_space ?? 'oklch'}, ${group.color.join(',')})`,
                    },
                },
                HTML.div(
                    group.icon && HTML.img({class: 'icon', src: group.icon}),
                    HTML.span({style: {font_weight: 'bold'}}, group.name),
                    ` (${count})`,
                ),
            ),
            groups && HTML.div(
                {
                    id: `${id}-groups`,
                    class: 'groups',
                },
                groups.map((group, i) => this.render_group(group, `${id}-${i}`, grouping)) ?? [],
            ),
            ...cards
                ?.sort((a, b) => ordering.compare(a, b))
                .flatMap((card, i, cards) => {
                    const last_deck_card = i === cards.length - 1;
                    const elements: HTMLDivElement[] = [];

                    for (let j = 0; j < card.quantity; j++) {
                        const last_of_card = j === card.quantity - 1;
                        elements.push(CardView.render(
                            card,
                            `${id}-card-${i}-${j}`,
                            last_of_card,
                            last_deck_card && last_of_card,
                            grouping?.face_id(card, group.value),
                        ));
                    }

                    const all_elements = this.rendered_cards.get(card) ?? [];
                    all_elements.push(...elements);
                    this.rendered_cards.set(card, all_elements);

                    return elements;
                }) ?? [],
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
