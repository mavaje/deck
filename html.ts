
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
                    switch (key.replaceAll('_', '-')) {
                        case 'class':
                            if (Array.isArray(value)) value = value.join(' ');
                            element.className = '';
                            element.classList.add(...String(value).split(' '));
                            return;

                        case 'style':
                            element.removeAttribute('style');
                            if (value && typeof value === 'object') {
                                Object.entries(value).map(([k, v]) => element.style.setProperty(
                                    k.replaceAll('_', '-'),
                                    String(v),
                                ));
                                return;
                            }
                            // fallthrough
                        default:
                            if (key.startsWith('on') && typeof value === 'function') {
                                element.addEventListener(key.slice(2), value);
                            } else {
                                element.setAttribute(key, String(value));
                            }
                    }
                });

                if (children) {
                    element.innerText = '';
                    element.append(...children
                        .map(child => child instanceof Node ? child : String(child)));
                }

                return element;
            }
        }
    }
) as {
    [T in keyof HTMLElementTagNameMap]: HTMLConstructor<T>;
};
