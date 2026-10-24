import {Designation} from "./designation";

export class Language extends Designation {
    static english = new Language('English', ['en']);
    static spanish = new Language('Spanish', ['es', 'sp']);
    static french = new Language('French', ['fr']);
    static german = new Language('German', ['de', 'ge']);
    static italian = new Language('Italian', ['it']);
    static portuguese = new Language('Portuguese', ['pt']);
    static japanese = new Language('Japanese', ['ja', 'jp']);
    static korean = new Language('Korean', ['ko', 'kr']);
    static russian = new Language('Russian', ['ru', 'rs']);
    static chinese_simplified = new Language('Simplified Chinese', ['zhs', 'cs']);
    static chinese_traditional = new Language('Traditional Chinese', ['zht', 'ct']);
    static hebrew = new Language('Hebrew', ['he']);
    static latin = new Language('Latin', ['la']);
    static ancient_greek = new Language('Ancient Greek', ['grc', 'ag']);
    static arabic = new Language('Arabic', ['ar']);
    static sanskrit = new Language('Sanskrit', ['sa']);
    static phyrexian = new Language('Phyrexian', ['ph']);
    static quenya = new Language('Quenya', ['qya']);
    static dwarvish = new Language('Dwarvish', ['dw']);
    static klingon = new Language('Klingon', ['tlh', 'kl']);

    static DEFAULT = this.english;

    is_default(): boolean {
        return this === Language.DEFAULT;
    }
}
