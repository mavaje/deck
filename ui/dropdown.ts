import {Attributes, HTML} from "./xml";

export type DropdownOption = {
    value?: string;
    on_select?: () => void;
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
            onclick: !option.disabled && (() => option.on_select()),
        }, option.value)));
    }

    event_listeners(): Attributes<HTMLElement, HTMLElementEventMap> {
        return {
            onfocus: target => this.open(target),
            onclick: target => this.open(target),
            onblur: () => this.close(),
            onkeydown: (target, event) => {
                let index = this.options.findIndex(({selected}) => selected);
                switch (event.key) {
                    case 'ArrowUp':
                        index = index < 0
                            ? this.options.length - 1
                            : (index + this.options.length - 1) % this.options.length;
                        this.options[index].on_select();
                        this.open(target, true);
                        event.preventDefault();
                        return;
                    case 'ArrowDown':
                        index = index < 0
                            ? 0
                            : (index + 1) % this.options.length;
                        this.options[index].on_select();
                        this.open(target, true);
                        event.preventDefault();
                        return;
                }
                if (event.key !== 'Enter') {
                    this.open(target);
                }
            }
        }
    }

    open(target: HTMLElement, instant: boolean = false): Dropdown {
        if (this.options.length < 2) return;
        const {offsetTop, offsetHeight, offsetLeft} = target;
        this.element.style.top = `${offsetTop + offsetHeight + 8}px`;
        this.element.style.left = `${offsetLeft}px`;
        target.parentElement.append(this.element);
        clearTimeout(this.closing_timeout);
        if (instant) {
            this.element.classList.add('open');
        } else {
            setTimeout(() => this.element.classList.add('open'));
        }
    }

    close() {
        this.element.classList.remove('open');
        this.closing_timeout = setTimeout(() => this.element.remove(), 200);
    }
}
