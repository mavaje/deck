import {CardClassifier} from "./card-classifier";
import {Board as CardBoard} from "../designation/board";
import {Group} from "./group";

export class Board extends CardClassifier {
    static name: string = 'Board';

    groups() {
        return CardBoard.all().map(board => new Group({
            name: board.name,
            value: board.code(),
            cards: this.cards.filter(card => card.on_board(board)),
        }));
    }
}
