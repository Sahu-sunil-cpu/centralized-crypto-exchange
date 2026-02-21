

export const getRandom = () => {
    return Math.floor(Math.random() * 100) * Math.floor(Math.random() * 100);
}

export function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}