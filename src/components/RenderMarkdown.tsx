import { Sx, TypographyStylesProvider } from "@mantine/core";
import { marked } from "marked";
import sanitize from "sanitize-html";
import clsx from "../util/clsx";

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

export const proseStyles = clsx(
  "prose prose-slate max-w-none dark:prose-invert dark:text-slate-300",
  // headings
  "prose-headings:scroll-mt-28 prose-headings:font-display prose-headings:font-bold lg:prose-headings:scroll-mt-[8.5rem]",
  // lead
  "prose-lead:text-slate-500 dark:prose-lead:text-slate-400",
  // links
  "prose-a:font-semibold dark:prose-a:text-sky-400",
  // link underline
  "prose-a:no-underline prose-a:shadow-[inset_0_-2px_0_0_var(--tw-prose-background,#fff),inset_0_calc(-1*(var(--tw-prose-underline-size,4px)+2px))_0_0_var(--tw-prose-underline,theme(colors.sky.300))] hover:prose-a:[--tw-prose-underline-size:6px] dark:[--tw-prose-background:theme(colors.slate.900)] dark:prose-a:shadow-[inset_0_calc(-1*var(--tw-prose-underline-size,2px))_0_0_var(--tw-prose-underline,theme(colors.sky.800))] dark:hover:prose-a:[--tw-prose-underline-size:6px]",
  // pre
  "prose-pre:rounded-xl prose-pre:bg-slate-900 prose-pre:shadow-lg dark:prose-pre:bg-slate-800/60 dark:prose-pre:shadow-none dark:prose-pre:ring-1 dark:prose-pre:ring-slate-300/10",
  // hr
  "dark:prose-hr:border-slate-800"
);

const RenderMarkdown: React.FC<
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > & {
    children: string;
    typographyStyles?: Sx;
    clamp?: number;
    proseAddons?: string;
  }
> = ({ children, typographyStyles, clamp, proseAddons, ...props }) => {
  return (
    <TypographyStylesProvider
      sx={(theme) => ({
        "& p:first-child": {
          marginBottom: "0 !important",
        },
        "& p:not(:first-child)": {
          marginTop: "12px !important",
          marginBottom: "0 !important",
        },
        "& h1:first-child, & h2:first-child, & h3:first-child, & h4:first-child, & h5:first-child, & h6:first-child":
          {
            marginTop: "0 !important",
          },
        "& hr": {
          border: "none",
          borderTop: "1px solid " + theme.colors.gray[7],
          margin: "1.5rem 0",
        },
        "& ul, & ol": {
          paddingLeft: "25px",
        },
        a: {
          textDecoration: "none !important",
        },
        // for li, dont space them apart
        "& li": {
          marginTop: ".25rem !important",
          marginBottom: ".25rem !important",
        },
        ...typographyStyles,
      })}
    >
      <div
        dangerouslySetInnerHTML={{
          __html: sanitize(parse(children || "")),
        }}
        style={{
          ...(clamp && {
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: clamp,
            WebkitBoxOrient: "vertical",
          }),
        }}
        className={clsx(proseStyles, proseAddons)}
        {...props}
      />
    </TypographyStylesProvider>
  );
};

export default RenderMarkdown;
