import {is_nullish} from "../value";

export type Attributes<
    EL extends any = any,
    EM extends any = any,
> = {
    class?: string | string[];
    style?: Record<string, any>;
    ontimeout?: (element: EL) => any;
} & {
    [K in keyof EM & string as `on${K}`]?: (element: EL, event: EM[K]) => any;
} & Record<string, any>;

type Child = number | string | Node;

type XMLConstructor<
    EL extends Element,
    EM extends any,
> = ((...children: Child[]) => EL) &
    ((children?: Child[]) => EL) &
    ((attributes: Attributes<EL, EM>, children?: Child[]) => EL) &
    ((attributes: Attributes<EL, EM>, ...children: Child[]) => EL);

type HTMLConstructor<T extends keyof HTMLElementTagNameMap> = XMLConstructor<HTMLElementTagNameMap[T], SVGElementEventMap>;

type SVGConstructor<T extends keyof SVGElementTagNameMap> = XMLConstructor<SVGElementTagNameMap[T], HTMLElementEventMap>;

const EVENT_LISTENERS: WeakMap<Element, Record<string, any>> = new WeakMap();

function create_element<T extends string>(
    tag: T,
    parameters: (Attributes | Child[] | Child)[],
    namespace?: string,
): Element {
    let attributes: Attributes = {};
    let children: Child[] = null;

    parameters.forEach(parameter => {
        if (Array.isArray(parameter)) {
            children = parameter;
        } else if (typeof parameter === 'object' && !(parameter instanceof Node)) {
            if (parameter) Object.assign(attributes, parameter);
        } else {
            children ??= [];
            children.push(parameter);
        }
    });

    let element: Element;
    if ('id' in attributes) {
        element = document.getElementById(String(attributes.id));
    }
    element ??= namespace
        ? document.createElementNS(namespace, tag)
        : document.createElement(tag);

    Object.entries(attributes).forEach(([key, value]) => {
        if (is_nullish(value)) return;

        key = key.replaceAll('_', '-');

        switch (key) {
            case 'class':
                if (!Array.isArray(value)) value = value.split(/\s+/g);
                element.className = '';
                element.classList.add(...value
                    .filter(c => c && c[0] !== '-'));
                element.classList.remove(...value
                    .filter(c => c[0] === '-' && c[1])
                    .map(c => c.slice(1)));
                return;

            case 'value':
                element.setAttribute(key, String(value));
                (element as any).value = value;
                return;

            case 'style':
                element.removeAttribute('style');
                if (typeof value === 'object' && 'style' in element) {
                    Object.entries(value).map(([k, v]) => {
                        if (v) (element as HTMLElement).style.setProperty(
                            k.replaceAll('_', '-'),
                            String(v),
                        );
                    });
                    return;
                }

            // fallthrough
            default:
                if (key.startsWith('on') && typeof value === 'function') {
                    const event = key.slice(2);

                    switch (event) {
                        case 'timeout':
                            setTimeout(() => value(element));
                            break;

                        default:
                            const listeners = EVENT_LISTENERS.get(element) ?? {};
                            if (listeners[event]) {
                                element.removeEventListener(event, listeners[event]);
                            }
                            const listener = (event: Event) => value(element, event);
                            element.addEventListener(event, listener);
                            listeners[event] = listener;
                            EVENT_LISTENERS.set(element, listeners);
                    }
                } else {
                    element.setAttribute(key, String(value));
                }
        }
    });

    if (children) {
        const new_children: ChildNode[] = children
            .filter(child => child || child === 0)
            .map(child => child instanceof Node
                ? child as ChildNode
                : document.createTextNode(String(child)));

        const new_set = new Set(new_children);
        for (const old_child of [...element.childNodes]) {
            if (!new_set.has(old_child)) {
                old_child.remove();
            }
        }

        let last_child: ChildNode = null;
        for (const new_child of new_children) {
            if (last_child) {
                if (new_child !== last_child.nextSibling) {
                    last_child.after(new_child);
                }
            } else {
                if (new_child !== element.childNodes[0]) {
                    element.insertBefore(new_child, element.childNodes[0]);
                }
            }
            last_child = new_child;
        }
    }

    return element;
}

export const HTML = new Proxy(
    {},
    {
        get(_, tag: keyof HTMLElementTagNameMap) {
            return (...parameters: (Attributes | Child[] | Child)[]) => {
                return create_element(tag, parameters);
            }
        }
    }
) as {
    [T in keyof HTMLElementTagNameMap]: HTMLConstructor<T>;
};

export const SVG = new Proxy(
    {},
    {
        get(_, tag: keyof SVGElementTagNameMap) {
            return (...parameters: (Attributes | Child[] | Child)[]) => {
                return create_element(tag, parameters, 'http://www.w3.org/2000/svg');
            }
        }
    }
) as {
    [T in keyof SVGElementTagNameMap]: SVGConstructor<T>;
};
