export type Confirmation = {
  identifier: string;
  title: string;
  body: string;
};

export const confirmations: Confirmation[] = [
  {
    identifier: "udmux-discord-challenge",
    title: "Thank you for verifying that you're human",
    body: "You have gained access to the Solarius Discord server. Thanks for your patience!"
  }
];