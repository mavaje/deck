
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

export function normalise(
    text: string,
    uppercase: boolean = false,
    strip: RegExp = /[^\w\s]/gi,
    separator: string = ' ',
): string {
    if (!text) return text;

    return (uppercase
        ? text.toUpperCase()
        : text.toLowerCase())
        .normalize('NFKD')
        .replaceAll('æ', 'ae')
        .replaceAll(strip, '')
        .replaceAll(/\s+/g, separator);
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

export function levenshtein(
    a: string,
    b: string,
): number {
    if (!a) return b?.length ?? 0;
    if (!b) return a.length;

    if (a === b) return 0;

    const distance: number[][] = [[]];
    for (let y = 0; y <= b.length; y++) distance[0][y] = y;
    for (let x = 1; x <= a.length; x++) {
        distance[x] = [x];
        for (let y = 1; y <= b.length; y++) {
            distance[x][y] = Math.min(
                distance[x - 1][y] + 1,
                distance[x][y - 1] + 1,
                distance[x - 1][y - 1] + (a[x - 1] !== b[y - 1] ? 1 : 0)
            );
        }
    }

    return distance[a.length][b.length];
}

export function trigram(
    a: string,
    b: string,
): number {
    const [
        trigrams_a,
        trigrams_b,
    ] = [a, b].map(string => {
        const set: Set<string> = new Set();
        string = ` ${string} `;
        for (let i = 0; i < string.length - 2; i++) {
            set.add(string.slice(i, i + 3));
        }
        return set;
    });

    if (trigrams_a.size === 0 || trigrams_b.size === 0) return 0;

    return trigrams_a.intersection(trigrams_b).size
        / trigrams_a.union(trigrams_b).size;
}

export function format(message: string, values: object = {}) {
    message = message
        .replaceAll(/^\s*|\s*$/g, '')
        .replaceAll(/\s*\n\s*/g, ' ↵ ');

    Object.entries(values).forEach(([name, value]) => {
        if (value instanceof RegExp) {
            value = value.toString();
        } else if (value instanceof Set) {
            value = `{${[...value].join(', ')}}`;
        } else {
            const visited = new WeakSet();
            value = JSON.stringify(value, (k, v) => {
                if (v && typeof v === 'object') {
                    if (visited.has(v)) return String(v);
                    visited.add(v);
                }
                return v;
            }) ?? 'undefined';
        }

        if (value.length > 40) value = value.slice(0, 32) + ' ... ' + value.slice(-8);
        message = message.replaceAll(`{${name}}`, value);
    });

    return message;
}

export function plural(count: number, noun: string, plural_noun: string = `${noun}s`): string {
    return count === 1
        ? noun
        : plural_noun;
}

export function count_plural(count: number, noun: string, plural_noun: string = `${noun}s`): string {
    return `${count} ${plural(count, noun, plural_noun)}`;
}
