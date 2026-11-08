import {DeckCard} from "../deck-card";
import {Face} from "../face";

export class FaceSelector {
    static front = new FaceSelector('Front', card => [card?.main_face()]);
    static display = new FaceSelector('Display', card => [card?.main_face(true)]);
    static any = new FaceSelector('Any Faces', card => card?.all_faces() ?? []);

    constructor(
        public name: string,
        public get: (card: DeckCard) => Face[],
    ) {}

    static all(): Record<string, FaceSelector> {
        return Object.fromEntries(
            Object.entries(this)
                .filter(([_, value]) => value instanceof this)
        );
    }
}
