export class Cache<T> {

    private data: Record<string, T> = {};

    public has(key: string): boolean {
        return key in this.data;
    }

    public has_any(keys: string[]): boolean {
        return keys.some(key => this.has(key));
    }

    public get(key: string): T {
        return this.data[key];
    }

    public get_any(keys: string[]): T {
        const key = keys.find(key => this.has(key));
        return this.get(key);
    }

    public put(key: string, data: T) {
        this.data[key] = data;
    }

    public put_each(keys: string[], data: T) {
        keys.forEach(key => this.data[key] = data);
    }

    public put_all(data: Record<string, T>) {
        Object.assign(this.data, data);
    }

    public dump() {
        const sorted_data = {};
        Object.keys(this.data)
            .sort()
            .forEach(key => sorted_data[key] = this.data[key]);
        console.log(sorted_data);
    }
}
