import {Card, Catalog, Error, Identifier, List, SFObject} from "./types";
import {Cache} from "./cache";
import {normalise, normalise_set} from "../text";
import {Language} from "../designation/language";

export class API {
    private static BASE_URL = 'https://api.scryfall.com';
    private static LAST_REQUEST = null;
    private static TOO_MANY_REQUESTS: boolean = false;

    public static CACHE = new Cache<SFObject>();

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
        if (this.TOO_MANY_REQUESTS) return null;

        const can_cache = method === 'GET' && !body;
        if (can_cache && this.CACHE.has(url)) {
            return this.CACHE.get(url) as T;
        }

        return new Promise(done => {
            const request = new XMLHttpRequest();
            request.open(method, url);
            request.setRequestHeader('Accept', 'application/json');
            request.addEventListener('load', () => {
                const response: T | Error = JSON.parse(request.responseText);
                if (response.object !== 'error') {
                    if (can_cache) this.CACHE.put(url, response);
                    done(response as T);
                } else {
                    console.error(response);
                    done(null);
                }
            });
            request.addEventListener('error', () => {
                this.TOO_MANY_REQUESTS = true;
                done(null);
            });

            if (body) {
                request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            }

            const throttle = /\/cards\/(search|named|random|collection)/.test(url) ? 500 : 100;
            const now = Date.now();
            const timeout = Math.max(0, API.LAST_REQUEST - now + throttle);

            API.LAST_REQUEST = now + timeout;

            setTimeout(() => {
                console.log(`${method} ${url}`);
                request.send(body ? JSON.stringify(body) : undefined)
            }, timeout);
        });
    }

    private static async get<T extends SFObject>(url: string): Promise<T> {
        return this.request<T>('GET', url);
    }

    private static async post<T extends SFObject>(url: string, payload: any): Promise<T> {
        return this.request<T>('POST', url, payload);
    }

    public static card_url(
        set: string,
        collector_number: string,
        language?: string,
        parameters: object = {},
    ): string {
        set = normalise_set(set);
        return this.url(language !== Language.DEFAULT.code()
            ? `cards/${set}/${collector_number}/${language}`
            : `cards/${set}/${collector_number}`, parameters);
    }

    public static card_named_url(
        name: string,
        set?: string,
        exact: boolean = false,
        parameters: object = {},
    ): string {
        name = normalise(name);
        set = normalise_set(set);
        return this.url(`cards/named`, {
            [exact ? 'exact' : 'fuzzy']: name,
            set,
            ...parameters,
        });
    }

    public static card_random_url(parameters: object = {}): string {
        return this.url(`cards/random`, parameters);
    }

    public static card_search_url(query: string, parameters: object = {}): string {
        return this.url(`cards/search`, {q: query, ...parameters});
    }

    public static card_autocomplete_url(name: string, parameters: object = {}): string {
        name = normalise(name);
        return this.url(`cards/autocomplete`, {q: name, ...parameters});
    }

    public static catalog_url(type: string, parameters: object = {}): string {
        return this.url(`catalog/${type}`, parameters);
    }

    public static card(
        set: string,
        collector_number: string,
        language?: string,
    ): Promise<Card> {
        return this.get<Card>(this.card_url(set, collector_number, language));
    }

    public static card_named(
        name: string,
        set?: string,
        exact: boolean = false,
    ): Promise<Card> {
        return this.get<Card>(this.card_named_url(name, set, exact));
    }

    public static random_card(
        query?: string,
    ): Promise<Card> {
        return this.get<Card>(this.card_random_url({q: query}));
    }

    public static card_autocomplete(
        name: string,
    ): Promise<Catalog> {
        return this.get<Catalog>(this.card_autocomplete_url(name));
    }

    public static CARDS_MAX = 75;
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

    public static card_search(
        query: string,
    ): Promise<List<Card>> {
        return this.get<List<Card>>(this.card_search_url(query));
    }

    public static card_search_first(
        query: string,
    ): Promise<Card> {
        return this.card_search(query).then(list => list?.data[0]);
    }

    public static next_page<T extends List>(page: T): Promise<T> {
        console.assert(!!page.next_page);
        return this.get<T>(page.next_page);
    }

    public static catalog(type: string): Promise<Catalog> {
        return this.get<Catalog>(this.catalog_url(type));
    }
}
