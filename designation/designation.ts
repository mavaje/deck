import {normalise} from "../text";

export type DesignationMap<T extends Designation = Designation> = T[] & Record<string, T>;

export abstract class Designation {
    protected static INSTANCES: Record<string, DesignationMap> = {};

    private static card_names: string[] = [
        'conspiracy',
    ];

    constructor(
        public name: string,
        public codes: string[] = [],
    ) {
        Designation.INSTANCES[this.constructor.name] ??= [] as DesignationMap;
        Designation.INSTANCES[this.constructor.name].push(this);
        Designation.INSTANCES[this.constructor.name][this.code()] = this;
    }

    code(upper: boolean = false): string {
        const code = this.codes[0] ?? this.name;
        return upper
            ? code.toUpperCase()
            : code;
    }

    regexp(code: string): RegExp {
        return new RegExp(`^(${
            normalise(code)
                .replaceAll(' ', '.?')
        })$`, 'i');
    }

    regexps(): RegExp[] {
        return [this.name, ...this.codes].map(code => this.regexp(code));
    }

    matches(input: string, exclude_card_names: boolean = false): boolean {
        let regexps = this.regexps();

        if (exclude_card_names) {
            regexps = regexps.filter(re => !Designation.card_names.some(code => re.test(code)));
        }

        return regexps.some(re => re.test(input));
    }

    toString(): string {
        return this.code();
    }

    static match<T extends typeof Designation>(this: T, input: string, exclude_card_names: boolean = false): InstanceType<T> {
        const instances = this.all();

        if (instances[input]) return instances[input];

        for (const instance of instances) {
            if (instance.matches(input, exclude_card_names)) {
                return instance;
            }
        }

        return null;
    }

    static all<T extends typeof Designation>(this: T): DesignationMap<InstanceType<T>> {
        return (this.INSTANCES?.[this.name] ?? []) as DesignationMap<InstanceType<T>>;
    }

    static clear<T extends typeof Designation>(this: T): void {
        this.INSTANCES[this.name] = [] as DesignationMap;
    }
}
