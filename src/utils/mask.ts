export const maskActivationKey = (key: string): string => {
    const parts = key.split('-');
    if (parts.length < 2) {
        return '****';
    }
    return parts
        .map((part, index) => {
            if (index < 2) {
                return part;
            }
            return '*'.repeat(part.length);
        })
        .join('-');
};
