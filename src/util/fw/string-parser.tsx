import React from "react";

export type Plugin = {
  regex: RegExp;
  process(match: RegExpExecArray, replacements: Replacement[]): void;
};

type Replacement = {
  text: string;
  component: React.ReactNode;
};

export class StringParser {
  private text: string;
  private replacements: Replacement[];
  private plugins: Plugin[];

  constructor(text: string) {
    this.text = text;
    this.replacements = [];
    this.plugins = [];
  }

  addPlugin(plugin: Plugin): StringParser {
    this.plugins.push(plugin);
    return this;
  }

  addPlugins(...plugins: Plugin[]): StringParser {
    this.plugins.push(...plugins);
    return this;
  }

  parse(): React.ReactNode[] {
    this.plugins.forEach((plugin) => {
      let match;
      while ((match = plugin.regex.exec(this.text)) !== null) {
        plugin.process(match, this.replacements);
      }
    });

    const parsedElements: React.ReactNode[] = [];
    let lastIndex = 0;

    this.replacements.forEach((replacement) => {
      const startIndex = this.text.indexOf(replacement.text, lastIndex);
      const endIndex = startIndex + replacement.text.length;

      if (startIndex !== -1) {
        parsedElements.push(this.text.slice(lastIndex, startIndex));
        parsedElements.push(replacement.component);
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
