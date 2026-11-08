import {CardClassifier} from "./card-classifier";
import {CardFace} from "../scryfall/types";
import {Face} from "../face";

export class Artist extends CardClassifier<string> {
    static name: string = 'Artist';
    static ungrouped_name: string = 'No Art';

    groups() {
        return this.group_by(
            card => card.card?.artist_ids,
            (id, card) => {
                let name: string = null;

                const face = card.faces().find(face => this.match_face(face, id));
                name ??= face?.face?.artist ?? face?.card?.artist;

                const index = card.card.artist_ids.indexOf(id);
                if (index >= 0) name ??= card.card.artist.split(/\s*&\s*/g)[index];

                return {
                    name,
                    value: id,
                };
            },
        );
    }

    match_face(face: Face, id: string): boolean {
        return (face.face as CardFace)?.artist_id === id;
    }
}
