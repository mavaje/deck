import {OneTimeLoader} from "./one-time-loader";
import {Cache} from "./cache";
import {API} from "./api";
import {Set} from "./types";

class SetCache extends Cache<Set> {

    private loader = new OneTimeLoader();

    async load(): Promise<void> {
        await this.loader.load(async () => {
            const set_list = await API.sets();
            if (set_list) {
                set_list.data.forEach(set => {
                    this.put(set.code, set);
                });
                this.dump();
            }
        });
    }
}

export const SET_CACHE = new SetCache();
SET_CACHE.load();
