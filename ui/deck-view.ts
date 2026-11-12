import {HTML} from "./xml";
import {Board} from "../designation/board";
import {Deck} from "../deck";
import {CardView} from "./card-view";
import {DeckCard} from "../deck-card";
import {CardClassifier} from "../card-classifier/card-classifier";
import {CardList} from "../card-list";
import {FaceSelector} from "../card-classifier/face-selector";
import {Group} from "../card-classifier/group";
import {edit_card_modal} from "./modal/card-edit-modal";

export class DeckView {

    static BY_BOARD: boolean = true;
    static GROUPING: typeof CardClassifier = CardClassifier;
    static ORDERING: typeof CardClassifier = CardClassifier;
    static FACE_SELECTOR: FaceSelector = FaceSelector.front;

    static DECK_ELEMENT = HTML.div({id: 'deck'});

    static render(deck: Deck = Deck.current): HTMLDivElement {
        CardView.renderings = new WeakMap();

        const show_boards = this.BY_BOARD
            && deck.some(card => !card.board.is_default());

        return HTML.div(
            {id: 'deck-cards', class: 'groups'},
            show_boards
                ? Board.all()
                    .map(board => this.render_board(deck.board(board), board))
                : [this.render_board(deck.copy())],
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
                class: 'label',
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
                this.render_group(new Group({
                    name: this.GROUPING.ungrouped_name,
                    cards: cards.filter(card => !CardView.renderings.has(card)),
                }), `${id}-ungrouped`),
            ),
        );
    }

    static render_group(
        group: Group,
        id: string | number = 0,
        grouping?: CardClassifier,
    ): HTMLDivElement {
        if (!group) return null;
        const {cards, groups} = group;
        if (!cards?.length && !groups?.length) return null;
        const ordering = new (this.ORDERING as any)() as CardClassifier;
        return HTML.div(
            {
                id,
                class: 'group',
            },
            group.name && HTML.div(
                {
                    id: `${id}-label`,
                    class: 'label',
                    style: {
                        '--gradient': group.color && `linear-gradient(to right in oklab, ${
                            group.color.map((c, i, {length}) => `${c} ${{0: '4px', [length - 1]: 'calc(100% - 4px)'}[i] ?? ''}`).join(',')
                        })`,
                    },
                    ontimeout: element => {
                        const top = element.getBoundingClientRect().top;
                        const {offsetTop, scrollTop} = this.DECK_ELEMENT;
                        element.style.top = `${top + scrollTop - offsetTop}px`;
                    },
                },
                HTML.div(
                    group.icon && HTML.img({class: 'icon', src: group.icon}),
                    HTML.span({style: {font_weight: 'bold'}}, group.name),
                    ` (${group.count()})`,
                ),
            ),
            groups && HTML.div(
                {
                    id: `${id}-groups`,
                    class: 'groups',
                },
                groups.map((group, i) => this.render_group(group, `${id}-${i}`, grouping)) ?? [],
            ),
            cards && HTML.div(
                {
                    id: `${id}-stack`,
                    class: 'stack',
                },
                cards
                    .sort((a, b) => ordering.compare(a, b))
                    .flatMap((card, i, cards) => {
                        const last_deck_card = i === cards.length - 1;
                        const elements: HTMLDivElement[] = [];

                        const quantity = Math.max(1, card.quantity);
                        for (let j = 0; j < quantity; j++) {
                            const last_of_card = j === quantity - 1;
                            elements.push(CardView.render(
                                card,
                                grouping?.face_id(card, group.value),
                                `${id}-card-${card.id}-${quantity - 1 - j}`,
                                !last_of_card,
                                last_deck_card && last_of_card,
                                () => edit_card_modal(card),
                            ));
                        }

                        return elements;
                    }),
            ),
        );
    }

    static set_background(card: DeckCard): boolean {
        const url = card.main_face().face?.image_uris.art;
        if (url) {
            HTML.div({
                id: 'background', style: {
                    '--card-image-url': `url(${url})`,
                }
            });
            return true;
        }
        return false;
    }
}
