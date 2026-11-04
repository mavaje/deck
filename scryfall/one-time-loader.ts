
export class OneTimeLoader {

    private promise: Promise<any> = null;

    async load(callback: () => Promise<any>): Promise<void> {
        this.promise ??= callback();
        return await this.promise;
    }
}
