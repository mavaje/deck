import {CardClassifier} from "./card-classifier";
import {Board as CardBoard} from "../designation/board";

export class Board extends CardClassifier {
    static name: string = 'Board';

    groups() {
        return CardBoard.all().map(board => ({
            name: board.name,
            value: board.code(),
            cards: this.cards.filter(card => card.on_board(board)),
        }));
    }
}
