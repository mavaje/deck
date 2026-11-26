import {HTML} from "./xml";
import {DeckCard} from "../deck-card";
import {DeckView} from "./deck/deck-view";

export class Dragger {

    static LAYER = HTML.div({id: 'drag-layer'});

    static card: DeckCard = null;
    static card_views: HTMLDivElement[] = null;

    static dragging: HTMLDivElement = null;

    static origin: HTMLElement = null;
    static origin_before: ChildNode = null;

    static grab(card: DeckCard, card_view: HTMLDivElement) {
        console.log('dragging start');

        Dragger.drop();
        Dragger.card = card;
        Dragger.card_views = DeckView.card_views.get(Dragger.card) ?? [card_view];
    }

    static drag(event: PointerEvent) {
        if (Dragger.card) {
            console.log('dragging');

            if (!Dragger.dragging) {
                Dragger.dragging = Dragger.card_views[Dragger.card_views.length - 1];
                Dragger.origin = Dragger.dragging.parentElement;
                Dragger.origin_before = Dragger.dragging.previousSibling;

                const {width, height} = Dragger.dragging.getBoundingClientRect();
                Dragger.origin.style.setProperty('--stack-width', `${width}px`);
                Dragger.origin.style.setProperty('--stack-height', `${height}px`);

                Dragger.LAYER.classList.toggle('show-quantity', Dragger.card_views.length > 1);

                Dragger.card_views.forEach(card_view => {
                    if (card_view !== Dragger.dragging) {
                        card_view.classList.add('dragged');
                    }
                });

                Dragger.LAYER.append(Dragger.dragging);
            }

            Dragger.LAYER.style.setProperty('--drag-x', `${event.x}px`);
            Dragger.LAYER.style.setProperty('--drag-y', `${event.y}px`);
        }
    }

    static drop(event?: PointerEvent) {
        if (Dragger.dragging) {
            console.log('dragging stop');

            Dragger.card_views.forEach(card_view => card_view.classList.remove('dragged'));

            if (Dragger.origin_before) {
                Dragger.origin_before.after(Dragger.dragging);
            } else {
                Dragger.origin.insertBefore(Dragger.dragging, Dragger.origin.firstChild);
            }
        }

        Dragger.card = null;
        Dragger.card_views = null;
        Dragger.dragging = null;
        Dragger.origin = null;
        Dragger.origin_before = null;
    }
}

document.addEventListener('pointermove', Dragger.drag);

document.addEventListener('pointerup', Dragger.drop);
document.addEventListener('pointercancel', Dragger.drop);
