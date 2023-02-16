import { Sx, TypographyStylesProvider } from "@mantine/core";
import { marked } from "marked";
import sanitize from "sanitize-html";

export const parse = (markdown: string) => {
  return marked(markdown || "", {
    walkTokens(token) {
      if (token.type === "text") {
        const mentionRegex = /@([a-zA-Z0-9_]+)/g;
        token.text = token.text.replace(
          mentionRegex,
          "<a href='/profile/$1'>@$1</a>"
        );
      }
      return token;
    },
    gfm: true,
    breaks: true,
  });
};

const RenderMarkdown: React.FC<
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > & { children: string; typographyStyles?: Sx }
> = ({ children, typographyStyles, ...props }) => {
  return (
    <TypographyStylesProvider sx={typographyStyles}>
      <div
        dangerouslySetInnerHTML={{
          __html: sanitize(parse(children || "")),
        }}
        {...props}
      />
    </TypographyStylesProvider>
  );
};

export default RenderMarkdown;
