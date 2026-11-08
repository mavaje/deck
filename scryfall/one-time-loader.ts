
export class OneTimeLoader {

    private promise: Promise<any> = null;
    public is_loaded: boolean = false;

    async load(callback: () => Promise<any>): Promise<void> {
        this.promise ??= callback();
        const result = await this.promise;
        this.is_loaded = true;
        return result;
    }
}
