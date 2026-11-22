export class Cache<T> {

    constructor(private data: Record<string, T> = {}) {}

    normalise_key(key: string): string {
        return key;
    }

    public has(key: string): boolean {
        key = this.normalise_key(key);
        return key in this.data;
    }

    public has_any(keys: string[]): boolean {
        return keys.some(key => this.has(key));
    }

    public get(key: string): T {
        key = this.normalise_key(key);
        return this.data[key];
    }

    public get_any(keys: string[]): T {
        const key = keys.find(key => this.has(key));
        return this.get(key);
    }

    public put(key: string, data: T): T {
        key = this.normalise_key(key);
        this.data[key] = data;
        return data;
    }

    public put_each(keys: string[], data: T) {
        keys.forEach(key => this.put(key, data));
    }

    public put_all(data: Record<string, T>) {
        Object.entries(data)
            .forEach(([key, data]) => this.put(key, data));
    }

    public remember(key: string, evaluate: () => T): T {
        return this.get(key)
            ?? this.put(key, evaluate());
    }

    public forget(key: string): void {
        key = this.normalise_key(key);
        delete this.data[key];
    }

    public dump() {
        const sorted_data = {};
        Object.keys(this.data)
            .sort()
            .forEach(key => sorted_data[key] = this.data[key]);
        console.log(sorted_data);
    }
}
