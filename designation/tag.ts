import {Designation} from "./designation";

export class Tag extends Designation {

    protected static allows_numeric_keys: boolean = true;

    constructor(
        tag: string,
        codes?: string[],
        public hex?: string,
    ) {
        super(tag, codes);
    }

    public static match_or_new(input: string, hex?: string): Tag {
        let tag = Tag.match(input);

        if (!tag) {
            tag = new Tag(input, undefined, hex?.toLowerCase());
            this[tag.code()] = tag;
        }

        return tag;
    }

    public to_string(separator: string = ':'): string {
        return this.name + (this.hex ? separator + this.hex : '');
    }

    public toString(): string {
        return this.to_string();
    }
}
