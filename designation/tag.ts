import {Designation} from "./designation";

export class Tag extends Designation {

    constructor(
        tag: string,
        codes?: string[],
        public hex?: string,
    ) {
        super(tag, codes);
    }

    public static match_or_new(input: string, hex?: string): Tag {
        return Tag.match(input) ?? new Tag(input, undefined, hex?.toLowerCase());
    }

    public to_string(separator: string = ':'): string {
        return this.name + (this.hex ? separator + this.hex : '');
    }

    public toString(): string {
        return this.to_string();
    }
}
