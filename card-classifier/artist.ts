import {CardClassifier} from "./card-classifier";
import {CardFace} from "../scryfall/types";
import {Face} from "../face";

export class Artist extends CardClassifier<string> {
    static name: string = 'Artist';

    groups() {
        return this.group_by(
            card => card.card?.artist_ids,
            (id, card) => ({
                name: card.card.artist.split(/\s*&\s*/g)[card.card.artist_ids.indexOf(id)],
                value: id,
            }),
        );
    }

    match_face(face: Face, id: string): boolean {
        return (face.face as CardFace)?.artist_id === id;
    }
}
