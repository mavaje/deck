import {Attributes, HTML} from "./xml";
import {Language} from "../designation/language";

export type DropdownOption<T = any> = {
    label?: string;
    input_value?: string;
    value?: T;
    discouraged?: boolean;
    disabled?: boolean;
    element?: HTMLDivElement;
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
        options.forEach(option => {
            option.label ??= `${option.value}`;
            option.input_value ??= option.label;
        });
        this.input = HTML.input({
            ...attributes,
            ...this.event_listeners(),
        }, this.dropdown = HTML.div({
            id: `${attributes.id}-dropdown`,
            class: 'dropdown',
        }, options.map(option => option.element = HTML.div({
                class: [
                    'option',
                    option.discouraged && 'discouraged',
                    option.disabled && 'disabled',
                    option.input_value === attributes.value && 'selected',
                ],
                lang: Language.detect_font(option.label)?.code(),
                onclick: !option.disabled && (() => this.select(option)),
            }, option.label))));
    }

    event_listeners(): Attributes<HTMLElement, HTMLElementEventMap> {
        return {
            onfocus: target => this.open(target),
            onclick: target => this.open(target),
            onblur: () => this.close(),
            onkeypress: (input, {key}) => {
                if (key === 'Enter') {
                    input.blur();
                }
            },
            onkeydown: (target, event) => {
                let index = this.options
                    .findIndex(({input_value}) => input_value === this.input.value);
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
        this.input.value = option.input_value;
        this.options.forEach(o =>
            o.element.classList.toggle('selected', o === option));
        this.on_select(option);
    }

    open(target: HTMLElement, instant: boolean = false): Dropdown {
        this.options.forEach(option => {
            option.element.classList.toggle('selected', option.input_value === this.input.value);
        });

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
