export const copyToClipboard = async (text: string): Promise<void> => {
    await navigator.clipboard.writeText(text);
};

// export const scrollToTop = (): void => window.scrollTo({ top: 0, behavior: 'smooth' });

// export const scrollToElement = (selector: string): void => {
//     const el = document.querySelector(selector);
//     if (el) el.scrollIntoView({ behavior: 'smooth' });
// };

// export const debounce = <F extends (...args: any[]) => any>(fn: F, delay: number): F => {
//     let timeout: ReturnType<typeof setTimeout>;
//     return ((...args: any[]) => {
//         clearTimeout(timeout);
//         timeout = setTimeout(() => fn(...args), delay);
//     }) as F;
// };

// export const throttle = <F extends (...args: any[]) => any>(fn: F, limit: number): F => {
//     let lastCall = 0;
//     return ((...args: any[]) => {
//         const now = Date.now();
//         if (now - lastCall >= limit) {
//             lastCall = now;
//             fn(...args);
//         }
//     }) as F;
// };
