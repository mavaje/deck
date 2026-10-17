import {Card, Catalog, Error, Identifier, List, SFObject} from "./types";

export class API {
    private static BASE_URL = 'https://api.scryfall.com';

    private static LAST_REQUEST = null;

    private static url(path: string, parameters: object = {}): string {
        let url = `${this.BASE_URL}/${path}`;

        const query = new URLSearchParams();
        Object.entries(parameters).forEach(([key, value]) => {
            if (value) query.set(key, value);
        });
        if (query.size > 0) url += `?${query}`;

        return url;
    }

    private static async request<T extends SFObject>(
        method: string,
        url: string,
        body?: any,
    ): Promise<T> {
        return new Promise(done => {
            const throttle = /\/cards\/(search|named|random|collection)/.test(url) ? 500 : 100;
            const now = Date.now();
            const timeout = Math.max(0, API.LAST_REQUEST - now + throttle);

            API.LAST_REQUEST = now + timeout;

            setTimeout(async () => {
                const request = new XMLHttpRequest();
                request.open(method, url);
                request.setRequestHeader('Accept', 'application/json');
                request.addEventListener('load', () => {
                    const response: T | Error = JSON.parse(request.responseText);
                    if (response.object !== 'error') {
                        done(response as T);
                    } else {
                        console.error(response);
                        done(null);
                    }
                });
                if (body) {
                    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
                    request.send(JSON.stringify(body));
                } else {
                    request.send();
                }
            }, timeout);
        });
    }

    private static async get<T extends SFObject>(url: string): Promise<T> {
        return this.request('GET', url);
    }

    private static async post<T extends SFObject>(url: string, payload: any): Promise<T> {
        return this.request('POST', url, payload);
    }

    public static card(
        set: string,
        collector_number: number | string,
        language?: string,
    ): Promise<Card> {
        return this.get<Card>(this.url(language
            ? `cards/${set}/${collector_number}/${language}`
            : `cards/${set}/${collector_number}`));
    }

    public static card_named(
        name: string,
        set?: string,
        exact: boolean = false,
    ): Promise<Card> {
        return this.get<Card>(this.url(`cards/named`, {
            [exact ? 'exact' : 'fuzzy']: name,
            set,
        }));
    }

    public static random_card(
        query?: string,
    ): Promise<List<Card>> {
        return this.get<List<Card>>(this.url(`cards/random`, {q: query}));
    }

    public static card_autocomplete(
        name: string,
    ): Promise<Catalog> {
        return this.get<Catalog>(this.url(`cards/autocomplete`, {q: name}));
    }

    public static cards(
        identifiers: Identifier[],
    ): Promise<List<Card>> {
        identifiers.forEach(identifier => {
            Object.entries({
                id: String,
                mtgo_id: Number,
                multiverse_id: Number,
                oracle_id: String,
                illustration_id: String,
                name: String,
                set: String,
                collector_number: String,
            }).forEach(([key, type]) => {
                if (identifier[key]) {
                    identifier[key] = type(identifier[key]);
                } else {
                    delete identifier[key];
                }
            });
        });

        return this.post<List<Card>>(this.url(`cards/collection`), {identifiers});
    }

    public static search_cards(
        query: string,
    ): Promise<List<Card>> {
        return this.get<List<Card>>(this.url(`cards/search`, {q: query}));
    }

    public static next_page<T extends List>(page: T): Promise<T> {
        console.assert(!!page.next_page);
        return this.get<T>(page.next_page);
    }
}
