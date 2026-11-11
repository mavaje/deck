import {HTML} from "../xml";

const MODALS = HTML.div({
    id: 'modals',
    onclick: () => hide_all_modals(),
});

export function modal(): HTMLDivElement {
    return HTML.div(
        {class: 'modal'},
    );
}

export function show_modal(modal: Element): void {
    hide_all_modals();
    modal.classList.add('show');
    modal.addEventListener('click', event => event.stopPropagation());
}

export function hide_all_modals(): void {
    for (const child of MODALS.children) {
        hide_modal(child);
    }
}

export function hide_modal(modal: Element): void {
    modal.classList.remove('show');
}
