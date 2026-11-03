
export function is_nullish(value: any): boolean {
    return value === null
        || value === undefined
        || Number.isNaN(value);
}
