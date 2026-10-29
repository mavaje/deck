
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

export function fraction(number: number): string {
    const fraction = {
        [0.5]: '½',
    }[Math.abs(number % 1)];

    if (fraction) {
        const integer = Math.trunc(number);
        return integer
            ? `${integer}${fraction}`
            : fraction;
    }

    return `${number}`;
}

export function normalise(text: string, uppercase: boolean = false, strip: RegExp = /[^\w\s]/gi, separator: string = ' '): string {
    if (!text) return text;

    return (uppercase
        ? text.toUpperCase()
        : text.toLowerCase())
        .normalize('NFKD')
        .replaceAll('æ', 'ae')
        .replaceAll(strip, '')
        .replaceAll(/\s+/g, separator);
}

export function normalise_set(set: string, uppercase: boolean = false): string {
    return normalise(set, uppercase, /[^0-9a-z]/gi)
}

export function preserve_case(target: string, template: string) {
    if (!target) return '';
    if (!template) return target;

    const first = template[0];
    const last = template.slice(-1);

    if (first === first.toLowerCase()) {
        return target.toLowerCase();
    } else if (last === last.toUpperCase()) {
        return target.toUpperCase();
    } else {
        return target;
    }
}
