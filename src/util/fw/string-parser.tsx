import { Anchor } from "@mantine/core";
import React from "react";

type LinkReplacement = {
  text: string;
  url: string;
  isBold?: boolean;
  cleanText?: string;
};

type BoldReplacement = {
  text: string;
  isBold: boolean;
  cleanText: string;
};

export class StringParser {
  private text: string;
  private replacements: (BoldReplacement | LinkReplacement)[];

  constructor(text: string) {
    this.text = text;
    this.replacements = [];
  }

  bold(): StringParser {
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;

    while ((match = boldRegex.exec(this.text)) !== null) {
      const boldText = match[0];
      const cleanText = match[1];
      this.replacements.push({ text: boldText, isBold: true, cleanText });
    }

    return this;
  }

  links(): StringParser {
    const linkRegex =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    let match;

    while ((match = linkRegex.exec(this.text)) !== null) {
      const url = match[0];
      const text = match[0];
      this.replacements.push({ text, url });
    }

    return this;
  }

  parse(): React.ReactNode[] {
    const parsedElements: React.ReactNode[] = [];
    let lastIndex = 0;

    const sortedReplacements = this.replacements.sort((a, b) => {
      return this.text.indexOf(a.text) - this.text.indexOf(b.text);
    });

    sortedReplacements.forEach((replacement) => {
      const startIndex = this.text.indexOf(replacement.text, lastIndex);
      const endIndex = startIndex + replacement.text.length;

      if (startIndex !== -1) {
        parsedElements.push(this.text.slice(lastIndex, startIndex));

        if ("url" in replacement) {
          if ("isBold" in replacement) {
            const { cleanText, isBold } = replacement;
            const element = isBold ? (
              <span className="font-semibold" key={startIndex}>
                <Anchor
                  href={replacement.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {cleanText}
                </Anchor>
              </span>
            ) : (
              <Anchor
                href={replacement.url}
                target="_blank"
                rel="noopener noreferrer"
                key={startIndex}
              >
                {replacement.text}
              </Anchor>
            );

            parsedElements.push(element);
          } else {
            parsedElements.push(
              <Anchor
                key={startIndex}
                href={replacement.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {replacement.text}
              </Anchor>
            );
          }
        } else {
          const { cleanText, isBold } = replacement;
          const element = isBold ? (
            <span className="font-semibold" key={startIndex}>
              {cleanText}
            </span>
          ) : (
            cleanText
          );

          parsedElements.push(element);
        }

        lastIndex = endIndex;
      }
    });

    if (lastIndex < this.text.length) {
      parsedElements.push(this.text.slice(lastIndex));
    }

    return parsedElements;
  }

  static t(text: string): StringParser {
    return new StringParser(text);
  }
}
