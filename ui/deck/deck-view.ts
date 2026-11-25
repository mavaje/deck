import {HTML} from "../xml";
import {Zone} from "../../designation/zone";
import {Deck} from "../../deck";
import {CardView} from "../card-view";
import {DeckCard} from "../../deck-card";
import {CardClassifier} from "../../card-classifier/card-classifier";
import {CardList} from "../../card-list";
import {FaceSelector} from "../../card-classifier/face-selector";
import {Group} from "../../card-classifier/group";
import {CardPanel} from "./card-panel";
import {DeckError, DeckValidator} from "../../deck-validator";
import {Zone as ZoneGrouping} from '../../card-classifier/zone';

export class DeckView {

    static card_views = new WeakMap<DeckCard, HTMLDivElement[]>();
    static errors: DeckError[] = [];

    static BY_ZONE: boolean = true;
    static GROUPING: typeof CardClassifier<any> = CardClassifier;
    static ORDERING: typeof CardClassifier<any> = CardClassifier;
    static FACE_SELECTOR: FaceSelector = FaceSelector.front;

    static DECK_ELEMENT = HTML.div({id: 'deck'});
    static DECK_CARDS = HTML.div({id: 'deck-cards'});

    static render(deck: Deck = Deck.CURRENT): HTMLDivElement {
        this.errors = new DeckValidator(deck).validate();

        // console.log(this.errors);

        DeckView.card_views = new WeakMap();

        const show_zones = this.BY_ZONE
            && deck.some(card => !card.zone.is_default());

        return HTML.div(
            {
                id: 'deck-cards',
                onclick: () => CardPanel.close(),
            },
            show_zones
                ? this.render_zones(deck, 'deck-groups')
                : this.render_groups(deck, 'deck-groups'),
        );
    }

    private static render_zones(deck: Deck, id: string): HTMLDivElement {
        return HTML.div({
            id,
            class: 'groups',
        }, Zone.all().map(zone => this.render_zone(deck.zone(zone), zone)));
    }

    private static render_zone(
        cards: CardList,
        zone?: Zone,
    ): HTMLDivElement {
        if (cards.length === 0) return null;
        const id = `zone-${zone ?? 'all'}`;
        const icon = ZoneGrouping.ZONE_GROUPS[zone.code()]?.icon;
        return HTML.div(
            {
                id,
                class: 'group',
            },
            zone && HTML.div({
                id: `${id}-label`,
                class: ['label', 'fade-in'],
            }, HTML.div(
                icon && HTML.img({class: 'icon', src: icon}),
                HTML.span({style: {font_weight: 'bold'}}, zone.name),
                ` (${cards.count()})`,
            )),
            this.render_groups(cards, `${id}-groups`),
        );
    }

    private static render_groups(
        cards: CardList,
        id: string,
    ) {
        const grouping = new (this.GROUPING as any)(cards.copy()) as CardClassifier;
        return HTML.div(
            {
                id,
                class: 'groups',
            },
            ...grouping.groups()
                .map((group, j) => this.render_group(group, `${id}-group-${j}`, grouping)),
            this.render_group(new Group({
                name: this.GROUPING.ungrouped_name,
                cards: cards.filter(card => !DeckView.card_views.has(card)),
            }), `${id}-ungrouped`),
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
                    class: ['label', 'fade-in'],
                    style: {
                        '--gradient': group.color && `linear-gradient(to right in oklab, ${
                            group.color.map((c, i, {length}) => `${c} ${{0: '4px', [length - 1]: 'calc(100% - 4px)'}[i] ?? ''}`).join(',')
                        })`,
                    },
                    ontimeout: element => {
                        const top = element.getBoundingClientRect().top;
                        const {offsetTop, scrollTop} = this.DECK_ELEMENT;
                        element.style.top = `${top - scrollTop - offsetTop}px`;
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
                    .flatMap(card => {
                        const elements: HTMLDivElement[] = [];

                        const quantity = Math.max(1, card.quantity);
                        for (let j = 0; j < quantity; j++) {
                            const last_of_card = j === quantity - 1;
                            elements.push(CardView.render(
                                card,
                                `${id}-card-${card.id}-${quantity - 1 - j}`,
                                {
                                    face_id: grouping?.face_id(card, group.value),
                                    is_duplicate: !last_of_card,
                                    in_deck_view: true,
                                    on_click: () => CardPanel.open(card),
                                    on_drag: () => {},
                                },
                            ));
                        }

                        const card_views = DeckView.card_views.get(card) ?? [];
                        card_views.push(...elements);
                        DeckView.card_views.set(card, card_views);

                        return elements;
                    }),
            ),
        );
    }

    static focus(card: DeckCard) {
        DeckView.card_views.get(card)
            ?.forEach(element => element.classList.add('focus'));
    }

    static unfocus(card: DeckCard) {
        DeckView.card_views.get(card)
            ?.forEach(element => element.classList.remove('focus'));
    }

    static select(card: DeckCard) {
        DeckView.card_views.get(card)
            ?.forEach(element => element.classList.add('select'));
    }

    static deselect(card: DeckCard) {
        DeckView.card_views.get(card)
            ?.forEach(element => element.classList.remove('select'));
    }
}
