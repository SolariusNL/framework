import { Plugin } from "@/util/fw/string-parser";
import { randomId } from "@mantine/hooks";
import emojiRegex from "emoji-regex";

const emojiPlugin: Plugin = {
  regex: emojiRegex(),
  process: (match, replacements) => {
    const text = match[0];

    const component = (
      <span className="text-xl" key={randomId()}>
        {text}
      </span>
    );
    replacements.push({ text, component });
  },
};

export default emojiPlugin;
