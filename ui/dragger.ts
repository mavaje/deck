import {HTML} from "./xml";
import {DeckView} from "./deck/deck-view";

export class Dragger {

    static LAYER = HTML.div({id: 'drag-layer'});

    static CARD: HTMLDivElement = null;

    private static ORIGIN: HTMLElement = null;
    private static ORIGIN_BEFORE: ChildNode = null;

    static grab(card: HTMLDivElement, event: PointerEvent) {
        console.log('dragging start');
        Dragger.CARD = card;
        Dragger.ORIGIN = card.parentElement;
        Dragger.ORIGIN_BEFORE = card.previousSibling;
    }

    static drag(event: PointerEvent) {
        const card = Dragger.CARD;
        if (card) {
            if (card.parentElement !== Dragger.LAYER) {
                Dragger.LAYER.append(card);
            }
            Dragger.LAYER.classList.add('dragging');
            DeckView.DECK_CARDS.classList.remove('hoverable');
            console.log('dragging');
            const shift = HTML.div({id: `${card.id}-shift`});
            shift.style.setProperty('left', `${event.x}px`);
            shift.style.setProperty('top', `${event.y}px`);
        }
    }

    static drop(event: PointerEvent) {
        if (Dragger.CARD?.parentElement === Dragger.LAYER) {
            console.log('dragging stop');
            const card = Dragger.CARD;
            const shift = HTML.div({id: `${card.id}-shift`});
            Dragger.LAYER.classList.remove('dragging');
            shift.style.removeProperty('left');
            shift.style.removeProperty('top');

            if (Dragger.ORIGIN_BEFORE) {
                Dragger.ORIGIN_BEFORE.after(card);
            } else {
                Dragger.ORIGIN.insertBefore(card, Dragger.ORIGIN.firstChild);
            }
        }
        DeckView.DECK_CARDS.classList.add('hoverable');
        Dragger.CARD = null;
        Dragger.ORIGIN = null;
        Dragger.ORIGIN_BEFORE = null;
    }
}

document.addEventListener('pointermove', Dragger.drag);

document.addEventListener('pointerup', Dragger.drop);
document.addEventListener('pointercancel', Dragger.drop);
