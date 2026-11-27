import {HTML} from "./xml";
import {DeckCard} from "../deck-card";
import {DeckView} from "./deck/deck-view";
import {Deck} from "../deck";
import {CardLocation, CardView} from "./card-view";
import {CardPanel} from "./deck/card-panel";
import {DeckAddCard} from "../history/deck-add-card";
import {CardSetPrinting} from "../history/card-set-printing";

export class Dragger {

    static LAYER = HTML.div({id: 'drag-layer'});

    static card: DeckCard = null;
    static card_view: HTMLDivElement = null;
    static card_views: HTMLDivElement[] = null;

    static origin_element: HTMLElement = null;
    static origin: CardLocation = null;
    static destination: CardLocation = null;

    static starting_position: [number, number] = null;

    static dragging: HTMLDivElement = null;

    static grab(card: DeckCard, card_view: HTMLDivElement, location: CardLocation, event: PointerEvent) {
        Dragger.drop();
        Dragger.card = card;
        Dragger.card_view = card_view;
        Dragger.card_views = location === 'deck'
            ? DeckView.card_views.get(Dragger.card)
            : [card_view];
        Dragger.origin_element = card_view.parentElement;
        Dragger.origin = location;
        Dragger.starting_position = [event.x, event.y];

        document.body.classList.add('dragging');
    }

    static drag(event: PointerEvent) {
        if (!Dragger.card) return;

        if (!Dragger.dragging) {
            const [x, y] = Dragger.starting_position;
            if (Math.hypot(event.x - x, event.y - y) < 8) return;

            Dragger.dragging = Dragger.render_card();

            const {top, left, width, height} = Dragger.card_view.getBoundingClientRect();

            Dragger.origin_element.style.setProperty('--stack-width', `${width}px`);
            Dragger.origin_element.style.setProperty('--stack-height', `${height}px`);

            Dragger.dragging.style.setProperty('transform', `translate(${left - x}px, ${top - y}px)`);

            Dragger.LAYER.classList.toggle('show-quantity', Dragger.card_views.length > 1);

            if (Dragger.origin === 'deck') {
                Dragger.card_views.forEach(card_view => card_view.classList.add('dragged'));
            }

            Dragger.LAYER.append(Dragger.dragging);
        } else {
            Dragger.dragging.style.removeProperty('transform');
        }

        const {width, height} = Dragger.dragging.getBoundingClientRect();

        Dragger.LAYER.style.setProperty('--drag-x', `${event.x - width / 2}px`);
        Dragger.LAYER.style.setProperty('--drag-y', `${event.y - height / 2}px`);

        Dragger.destination = Dragger.destination_at(event.x, event.y);

        if (Dragger.destination === 'deck') {
            HTML.div({id: 'deck-cards', data_drop: Dragger.origin});
        } else {
            HTML.div({id: 'deck-cards', data_drop: null});
        }

        if (Dragger.destination === 'panel') {
            HTML.div({id: CardPanel.id, data_drop: Dragger.origin});
        } else {
            HTML.div({id: CardPanel.id, data_drop: null});
        }
    }

    static drop(event?: PointerEvent) {
        if (Dragger.dragging) {
            Dragger.dragging.remove();
            Dragger.dragging = null;

            Dragger.card_views.forEach(card_view => card_view.classList.remove('dragged'));

            switch (Dragger.origin) {
                case 'deck':
                    switch (Dragger.destination) {
                        case 'deck':
                            // const index = Deck.CURRENT.indexOf(Dragger.card);
                            // if (index > -1) {
                            //     Deck.CURRENT.splice(index, 1);
                            //     Deck.CURRENT.push(Dragger.card);
                            // }
                            break;

                        case 'panel':
                            CardPanel.open(Dragger.card);
                            break;
                    }
                    break;

                case 'search':
                    switch (Dragger.destination) {
                        case 'deck':
                            DeckAddCard.do(
                                Deck.CURRENT,
                                Dragger.card,
                                null,
                                (new_card, existing_card) =>
                                    existing_card.card?.id === new_card.card?.id,
                            );
                            break;

                        case 'panel':
                            if (CardPanel.SELECTED) {
                                CardSetPrinting.do(CardPanel.SELECTED, Dragger.card.card);
                            }
                            break;
                    }
                    break;
            }
        }

        Dragger.card = null;

        document.body.classList.remove('dragging');

        HTML.div({id: 'deck-cards', data_drop: null});
        HTML.div({id: CardPanel.id, data_drop: null});
    }

    static destination_at(x: number, y: number): CardLocation {
        const is_inside = (element: HTMLElement) => {
            const {top, left, width, height} = element.getBoundingClientRect();
            return x >= left && x < left + width
                && y >= top && y < top + height;
        };

        if (!is_inside(document.body)) return null;

        if (is_inside(HTML.div({id: 'search'}))) return 'search';

        if (is_inside(CardPanel.element())) return 'panel';

        if (is_inside(DeckView.DECK_ELEMENT)) return 'deck';

        return null;
    }

    static render_card(): HTMLDivElement {
        return Dragger.card
            ? CardView.render(Dragger.card, 'dragging-card', {location: 'dragger'})
            : null;
    }
}

document.addEventListener('pointermove', Dragger.drag);

document.addEventListener('pointerup', Dragger.drop);
document.addEventListener('pointercancel', Dragger.drop);
