export {};

declare global {
  interface Window {
    suma: (arg: string) => number;
  }
}
