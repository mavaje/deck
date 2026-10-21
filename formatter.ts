
export function format(message: string, values: object = {}) {
    message = message
        .replaceAll(/^\s*|\s*$/g, '')
        .replaceAll(/\s*\n\s*/g, ' ↵ ');

    Object.entries(values).forEach(([name, value]) => {
        if (value instanceof RegExp) {
            value = value.toString();
        } else {
            value = JSON.stringify(value) ?? 'undefined';
        }

        if (value.length > 40) value = value.slice(0, 32) + ' ... ' + value.slice(-8);
        message = message.replaceAll(`{${name}}`, value);
    });

    return message;
}
