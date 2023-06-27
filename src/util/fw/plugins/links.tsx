import { Fw } from "@/util/fw";
import { Plugin } from "@/util/fw/string-parser";
import { Anchor } from "@mantine/core";
import { randomId } from "@mantine/hooks";

const linkPlugin: Plugin = {
  regex:
    /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi,
  process: (match, replacements) => {
    const url = match[0];
    const text = match[0];
    const shouldWarn = !url.startsWith("/");

    const component = (
      <span key={randomId()}>
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
    replacements.push({ text, component });
  },
};

export default linkPlugin;
