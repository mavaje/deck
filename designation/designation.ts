
export type DesignationMap<T extends Designation = Designation> = T[] & Record<string, T>;

export abstract class Designation {
    protected static INSTANCES: Record<string, DesignationMap> = {};

    constructor(
        public name: string,
        public codes: string[] = [],
    ) {
        Designation.INSTANCES[this.constructor.name] ??= [] as DesignationMap;
        Designation.INSTANCES[this.constructor.name].push(this);
        Designation.INSTANCES[this.constructor.name][this.code()] = this;
    }

    code(upper: boolean = false): string {
        return upper
            ? this.code().toUpperCase()
            : this.codes[0] ?? this.name;
    }

    matches(input: string, exclude_card_names: boolean = false): boolean {
        return [this.name, ...this.codes]
            .map(code => code.replaceAll(' ', '.?'))
            .some(code => new RegExp(`^(${code})$`, 'i').test(input));
    }

    toString(): string {
        return this.code();
    }

    public static match<T extends typeof Designation>(this: T, input: string, exclude_card_names: boolean = false): InstanceType<T> {
        const instances = this.all();

        if (instances[input]) return instances[input];

        for (const instance of instances) {
            if (instance.matches(input, exclude_card_names)) {
                return instance;
            }
        }

        return null;
    }

    public static all<T extends typeof Designation>(this: T): DesignationMap<InstanceType<T>> {
        return this.INSTANCES[this.name] as DesignationMap<InstanceType<T>>;
    }
}
