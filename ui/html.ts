import {is_nullish} from "../value";

type Attributes = Record<string, any> & {
    class?: string | string[];
    style?: Record<string, any>
};

type Child = number | string | Node;

type HTMLConstructor<T extends keyof HTMLElementTagNameMap> =
    ((...children: Child[]) => HTMLElementTagNameMap[T]) &
    ((children?: Child[]) => HTMLElementTagNameMap[T]) &
    ((attributes: Attributes, children?: Child[]) => HTMLElementTagNameMap[T]) &
    ((attributes: Attributes, ...children: Child[]) => HTMLElementTagNameMap[T]);

const EVENT_LISTENERS: WeakMap<HTMLElement, Record<string, any>> = new WeakMap();

export const HTML = new Proxy(
    {},
    {
        get<T extends keyof HTMLElementTagNameMap>(_, tag: T) {
            return (...parameters: (Attributes | Child[] | Child)[]) => {
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

                let element: HTMLElementTagNameMap[T];
                if ('id' in attributes) {
                    element = document.getElementById(String(attributes.id)) as HTMLElementTagNameMap[T];
                }
                element ??= document.createElement(tag);

                Object.entries(attributes).forEach(([key, value]) => {
                    if (is_nullish(value)) return;

                    switch (key.replaceAll('_', '-')) {
                        case 'class':
                            if (Array.isArray(value)) value = value.join(' ');
                            element.className = '';
                            element.classList.add(...String(value)
                                .split(/\s+/g)
                                .filter(Boolean));
                            return;

                        case 'style':
                            element.removeAttribute('style');
                            if (typeof value === 'object') {
                                Object.entries(value).map(([k, v]) => {
                                    if (v) element.style.setProperty(
                                        k.replaceAll('_', '-'),
                                        String(v),
                                    );
                                });
                                return;
                            }
                            // fallthrough
                        default:
                            if (key.startsWith('on') && typeof value === 'function') {
                                const listeners = EVENT_LISTENERS.get(element) ?? {};
                                const event = key.slice(2);
                                if (listeners[event]) {
                                    element.removeEventListener(event, listeners[event]);
                                }
                                element.addEventListener(event, value);
                                listeners[event] = value;
                                EVENT_LISTENERS.set(element, listeners);
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
        }
    }
) as {
    [T in keyof HTMLElementTagNameMap]: HTMLConstructor<T>;
};
