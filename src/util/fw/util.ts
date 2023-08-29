export const Util = {
  appUrl: (path: string) => {
    return `https://${process.env.NEXT_PUBLIC_HOSTNAME}${path}`;
  },
};
