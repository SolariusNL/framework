import { Anchor } from "@mantine/core";
import React from "react";
import { Fw } from "../fw";

type LinkReplacement = {
  text: string;
  url: string;
  isBold?: boolean;
  cleanText?: string;
  shouldWarn?: boolean;
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

  links(options: { warn?: boolean } = {}): StringParser {
    const linkRegex =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    let match;

    while ((match = linkRegex.exec(this.text)) !== null) {
      const url = match[0];
      const text = match[0];
      this.replacements.push({ text, url, shouldWarn: options.warn });
    }

    return this;
  }

  parse(): React.ReactNode[] {
    const parsedElements: React.ReactNode[] = [];
    let lastIndex = 0;

    const sortedReplacements = this.replacements.sort(
      (a, b) => this.text.indexOf(a.text) - this.text.indexOf(b.text)
    );

    sortedReplacements.forEach((replacement) => {
      const startIndex = this.text.indexOf(replacement.text, lastIndex);
      const endIndex = startIndex + replacement.text.length;

      if (startIndex !== -1) {
        parsedElements.push(this.text.slice(lastIndex, startIndex));

        if ("url" in replacement) {
          const { url, text, shouldWarn } = replacement;
          const AnchorElement: React.FC<{ replacement: LinkReplacement }> = (
            props
          ) => (
            <span key={startIndex}>
              <Anchor
                href={shouldWarn ? undefined : url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  if (shouldWarn) {
                    e.preventDefault();
                    e.stopPropagation();
                    Fw.Links.externalWarning(url);
                  }
                }}
              >
                {text}
              </Anchor>
            </span>
          );

          if ("isBold" in replacement) {
            const { isBold } = replacement;
            const element = isBold ? (
              <span className="font-semibold" key={startIndex}>
                <AnchorElement replacement={replacement} />
              </span>
            ) : (
              <AnchorElement replacement={replacement} />
            );

            parsedElements.push(element);
          } else {
            parsedElements.push(<AnchorElement replacement={replacement} />);
          }
        } else if ("isBold" in replacement) {
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
