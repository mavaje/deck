
const UNITS = [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
];

const TEENS = [
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
];

const TENS = [
    null,
    null,
    'twenty',
    'thirty',
    'forty',
    'fifty',
    'sixty',
    'seventy',
    'eighty',
    'ninety',
];

export function words_to_number(word: string): number {
    const words = word.split(' ');
    const ten = TENS.indexOf(words[0]);
    if (ten > 1) {
        switch (words.length) {
            case 1:
                return 10 * ten;
            case 2:
                const unit = UNITS.indexOf(words[1]);
                if (unit > -1) {
                    return 10 * ten + unit;
                }
        }
    }

    const teen = TEENS.indexOf(words[0]);
    if (teen > -1 && words.length === 1) {
        return 10 + teen;
    }

    const unit = UNITS.indexOf(words[0]);
    if (unit > -1 && words.length === 1) {
        return unit;
    }

    return null;
}

export function normalise(text: string, uppercase: boolean = false, strip: RegExp = /[^\w ]/gi): string {
    if (!text) return text;

    return (uppercase
        ? text.toUpperCase()
        : text.toLowerCase())
        .normalize('NFKD')
        .replaceAll('æ', 'ae')
        .replaceAll(strip, '');
}

export function normalise_set(set: string, uppercase: boolean = false): string {
    return normalise(set, uppercase, /[^0-9a-z]/gi)
}
