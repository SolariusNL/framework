import { randomId } from "@mantine/hooks";
import { Plugin } from "../string-parser";

const boldPlugin: Plugin = {
  regex: /\*\*(.*?)\*\*/g,
  process: (match, replacements) => {
    const boldText = match[0];
    const cleanText = match[1];
    const component = (
      <span className="font-semibold" key={randomId()}>
        {cleanText}
      </span>
    );
    replacements.push({ text: boldText, component });
  },
};

export default boldPlugin;
