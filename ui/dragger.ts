import {HTML} from "./xml";
import {DeckCard} from "../deck-card";
import {DeckView} from "./deck/deck-view";
import {Deck} from "../deck";
import {CardView} from "./card-view";

export class Dragger {

    static LAYER = HTML.div({id: 'drag-layer'});

    static card: DeckCard = null;
    static card_views: HTMLDivElement[] = null;

    static origin: HTMLElement = null;
    static location: string = null;

    static dragging: HTMLDivElement = null;

    static grab(card: DeckCard, card_view: HTMLDivElement, location: string) {
        console.log('dragging start');

        Dragger.drop();
        Dragger.card = card;
        Dragger.card_views = location === 'deck'
            ? DeckView.card_views.get(Dragger.card)
            : [card_view];
        Dragger.origin = card_view.parentElement;
        Dragger.location = location;

        document.body.classList.add('dragging');
    }

    static drag(event: PointerEvent) {
        if (Dragger.card) {
            console.log('dragging');

            if (!Dragger.dragging) {
                Dragger.dragging = Dragger.render_card();

                const {width, height} = Dragger.dragging.getBoundingClientRect();
                Dragger.origin.style.setProperty('--stack-width', `${width}px`);
                Dragger.origin.style.setProperty('--stack-height', `${height}px`);

                Dragger.LAYER.classList.toggle('show-quantity', Dragger.card_views.length > 1);

                if (Dragger.location === 'deck') {
                    Dragger.card_views.forEach(card_view => card_view.classList.add('dragged'));
                }

                Dragger.LAYER.append(Dragger.dragging);
            }

            Dragger.LAYER.style.setProperty('--drag-x', `${event.x}px`);
            Dragger.LAYER.style.setProperty('--drag-y', `${event.y}px`);
        }
    }

    static drop(event?: PointerEvent) {
        if (Dragger.dragging) {
            console.log('dragging stop');

            Dragger.dragging.remove();

            Dragger.card_views.forEach(card_view => card_view.classList.remove('dragged'));

            switch (Dragger.location) {
                case 'deck':
                    // const index = Deck.CURRENT.indexOf(Dragger.card);
                    // if (index > -1) {
                    //     Deck.CURRENT.splice(index, 1);
                    //     Deck.CURRENT.push(Dragger.card);
                    // }
                    break;

                case 'search':
                    add_card:
                    {
                        for (const card of Deck.CURRENT) {
                            if (card.matches(Dragger.card)) {
                                card.quantity += Dragger.card.quantity;
                                break add_card;
                            }
                        }

                        Deck.CURRENT.push(DeckCard.from_card(Dragger.card.card));
                    }

                    break;
            }

            Dragger.dragging = null;

            DeckView.render();
        }

        Dragger.card = null;
        Dragger.card_views = null;
        Dragger.origin = null;

        document.body.classList.remove('dragging');
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
