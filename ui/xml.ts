import {is_nullish} from "../value";

export type Attributes<
    EL extends any = any,
    EM extends any = any,
> = {
    class?: string | string[];
    style?: Record<string, any>;
    ontimeout?: (element: EL) => any;
    onremove?: (element: EL) => any;
    onrefresh?: (element: EL) => any;
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

type HTMLConstructor<T extends keyof HTMLElementTagNameMap> = XMLConstructor<HTMLElementTagNameMap[T], HTMLElementEventMap>;

type SVGConstructor<T extends keyof SVGElementTagNameMap> = XMLConstructor<SVGElementTagNameMap[T], SVGElementEventMap>;

const EVENT_LISTENERS: WeakMap<Element, Record<string, (event: Event) => any>> = new WeakMap();

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

    if (children) {
        const new_children: ChildNode[] = children
            .filter(child => child || child === 0)
            .map(child => child instanceof Node
                ? child as ChildNode
                : document.createTextNode(String(child)));

        const new_set = new Set(new_children);
        const ignore_children: Set<ChildNode> = new Set();
        for (const old_child of [...element.childNodes]) {
            if (!new_set.has(old_child)) {
                const listeners = EVENT_LISTENERS.get(old_child as Element);
                if (listeners?.remove) {
                    listeners.remove(undefined);
                    ignore_children.add(old_child);
                } else {
                    old_child.remove();
                }
            }
        }

        let last_child: ChildNode = null;
        for (const new_child of new_children) {
            if (last_child) {
                let previous_child = last_child;
                while (ignore_children.has(previous_child.nextSibling)) {
                    previous_child = previous_child.nextSibling;
                }
                if (new_child !== previous_child.nextSibling) {
                    previous_child.after(new_child);
                }
            } else {
                let first_child = element.firstChild;
                while (ignore_children.has(first_child)) {
                    first_child = first_child.nextSibling;
                }
                if (new_child !== first_child) {
                    element.insertBefore(new_child, first_child);
                }
            }
            last_child = new_child;
        }
    }

    const listeners = EVENT_LISTENERS.get(element) ?? {};
    listeners.refresh?.(undefined);

    Object.entries(attributes).forEach(([key, value]) => {
        key = key.replaceAll('_', '-');

        if (is_nullish(value) || value === false) {
            if (key.startsWith('on')) {
                const event = key.slice(2);
                element.removeEventListener(event as any, listeners[event]);
                delete listeners[event];
            } else {
                element.removeAttribute(key);
            }
            return;
        }

        switch (key) {
            case 'class':
                if (!Array.isArray(value)) value = value.split(/\s+/g);
                value = value.filter(Boolean);
                element.className = value.join(' ');
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
                } else {
                    element.setAttribute(key, String(value));
                }
                return;

            case 'value':
                element.setAttribute(key, String(value));
                (element as any).value = value;
                return;

            default:
                if (key.startsWith('on') && typeof value === 'function') {
                    const event = key.slice(2);

                    switch (event) {
                        case 'timeout':
                            setTimeout(() => value(element));
                            break;

                        default:
                            const listener = (event: Event) => value(element, event);
                            element.removeEventListener(event as any, listeners[event]);
                            element.addEventListener(event, listener);
                            listeners[event] = listener;
                    }
                } else {
                    element.setAttribute(key, String(value));
                }
        }
    });

    if (Object.entries(listeners).length > 0) {
        EVENT_LISTENERS.set(element, listeners);
    } else {
        EVENT_LISTENERS.delete(element);
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
