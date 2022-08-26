export const debug = (...args: any[]) => {
  if (!process.env.DEBUG) {
    return;
  }

  log(...args);
};

export const log = (...args: any[]) => console.log(...args);
