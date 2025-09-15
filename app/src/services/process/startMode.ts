export function checkStartMode(): boolean {
    const arg = process.argv;

    if (arg[2] === '--dev') {
        return true;
    } else {
        return false;
    }
}