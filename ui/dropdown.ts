import {Attributes, HTML} from "./xml";

export type DropdownOption = {
    value?: string;
    on_click?: () => void;
    selected?: boolean;
    discouraged?: boolean;
    disabled?: boolean;
};

export class Dropdown {
    element: HTMLDivElement;

    private closing_timeout: number = null;

    constructor(
        id: string,
        private options: DropdownOption[],
    ) {
        this.element = HTML.div({id, class: 'dropdown'}, options.map(option => HTML.div({
            class: [
                'option',
                option.selected ? 'selected' : '-selected',
                option.discouraged ? 'discouraged' : '-discouraged',
                option.disabled ? 'disabled' : '-disabled',
            ],
            onclick: !option.disabled && (() => option.on_click()),
        }, option.value)));
    }

    event_listeners(): Attributes<HTMLElement, HTMLElementEventMap> {
        return {
            onfocus: target => this.open(target),
            onclick: target => this.open(target),
            onblur: () => this.close(),
            onkeydown: (target, {key}) => {
                let index = this.options.findIndex(({selected}) => selected);
                if (index >= 0) {
                    switch (key) {
                        case 'ArrowUp':
                            index = (index + this.options.length - 1) % this.options.length;
                            this.options[index].on_click();
                            this.open(target);
                            return;
                        case 'ArrowDown':
                            index = (index + 1) % this.options.length;
                            this.options[index].on_click();
                            this.open(target);
                            return;
                    }
                    console.log(key);
                }
            }
        }
    }

    open(target: HTMLElement) {
        const {offsetTop, offsetHeight, offsetLeft} = target;
        this.element.style.top = `${offsetTop + offsetHeight + 8}px`;
        this.element.style.left = `${offsetLeft}px`;
        target.parentElement.append(this.element);
        setTimeout(() => this.element.classList.add('open'));
        clearTimeout(this.closing_timeout);
    }

    close() {
        this.element.classList.remove('open');
        this.closing_timeout = setTimeout(() => this.element.remove(), 200);
    }
}
