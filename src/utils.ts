export function toPascalCase(str: string): string {
    return `${str}`
        .toLowerCase()
        .replace(new RegExp(/[-_]+/, 'g'), ' ')
        .replace(new RegExp(/[^\w\s]/, 'g'), '')
        .replace(
            new RegExp(/\s+(.)(\w*)/, 'g'),
            ($1, $2, $3) => `${$2.toUpperCase() + $3}`
        )
        .replace(new RegExp(/\w/), s => s.toUpperCase());
}

export function toKebabCase(str: string): string {
    return `${str}`
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/\s+/g, '-')
        .toLowerCase();
}