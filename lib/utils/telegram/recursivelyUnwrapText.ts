export const recursivelyUnwrapText = ({ text }: { text: any }): string => Array.isArray(text) ? text.map(recursivelyUnwrapText).join(' ') : text
