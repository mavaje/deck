import {OneTimeLoader} from "./one-time-loader";
import {Cache} from "./cache";
import {API} from "./api";
import {Set} from "./types";
import {normalise} from "../text";

export class SetCache extends Cache<Set> {

    private loader = new OneTimeLoader();

    async load(): Promise<void> {
        await this.loader.load(async () => {
            const set_list = await API.sets();
            set_list?.data.forEach(set => {
                this.put(set.code, set);
                if (set.arena_code) {
                    this.put(set.arena_code, set);
                }
                if (set.mtgo_code) {
                    this.put(set.mtgo_code, set);
                }
            });
        });
    }

    is_loaded(): boolean {
        return this.loader.is_loaded;
    }

    normalise_key(key: string): string {
        return normalise(
            key,
            false,
            /[^0-9a-z]/gi,
        );
    }

    normalise(
        code: string,
        type: 'code' | 'arena_code' | 'mtgo_code' = 'code',
    ): string {
        code = this.normalise_key(code);
        return code
            && this.get(code)?.[type]
            || code;
    }
}

