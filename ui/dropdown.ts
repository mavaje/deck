import {Attributes, HTML} from "./xml";

export type DropdownOption<T = any> = {
    value?: T;
    label?: string;
    discouraged?: boolean;
    disabled?: boolean;
};

export class Dropdown<T = any> {
    input: HTMLInputElement;
    dropdown: HTMLDivElement;


    private closing_timeout: number = null;

    constructor(
        attributes: Attributes<HTMLInputElement, HTMLElementEventMap>,
        private on_select: (option: DropdownOption<T>) => any,
        private options: DropdownOption<T>[],
    ) {
        this.input = HTML.input({
            ...attributes,
            ...this.event_listeners(),
        }, this.dropdown = HTML.div({
            id: `${attributes.id}-dropdown`,
            class: 'dropdown',
        }, options.map(option => HTML.div({
                class: [
                    'option',
                    option.label === attributes.value && 'selected',
                    option.discouraged && 'discouraged',
                    option.disabled && 'disabled',
                ],
                onclick: !option.disabled && (() => this.select(option)),
            }, `${option.label ?? option.value}`))));
    }

    event_listeners(): Attributes<HTMLElement, HTMLElementEventMap> {
        return {
            onfocus: target => this.open(target),
            onclick: target => this.open(target),
            onblur: () => this.close(),
            onkeydown: (target, event) => {
                let index = this.options
                    .findIndex(({label}) => label === this.input.value);
                switch (event.key) {
                    case 'ArrowUp':
                        index = index < 0
                            ? this.options.length - 1
                            : (index + this.options.length - 1) % this.options.length;
                        this.select(this.options[index]);
                        this.open(target, true);
                        event.preventDefault();
                        return;
                    case 'ArrowDown':
                        index = index < 0
                            ? 0
                            : (index + 1) % this.options.length;
                        this.select(this.options[index]);
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

    select(option: DropdownOption<T>) {
        this.input.value = option.label ?? `${option.value}`;
        this.on_select(option);
    }

    open(target: HTMLElement, instant: boolean = false): Dropdown {
        if (this.options.length < 2
            || this.dropdown.classList.contains('opening')
            || this.dropdown.classList.contains('open')
        ) return;
        const {offsetTop, offsetHeight, offsetLeft} = target;
        this.dropdown.style.top = `${offsetTop + offsetHeight + 8}px`;
        this.dropdown.style.left = `${offsetLeft}px`;
        target.parentElement.append(this.dropdown);
        clearTimeout(this.closing_timeout);
        if (instant) {
            this.dropdown.classList.add('open');
        } else {
            this.dropdown.classList.add('opening');
            setTimeout(() => {
                this.dropdown.classList.remove('opening');
                this.dropdown.classList.add('open')
            });
        }
    }

    close() {
        this.dropdown.classList.remove('open');
        this.closing_timeout = setTimeout(() => this.dropdown.remove(), 200);
    }
}
