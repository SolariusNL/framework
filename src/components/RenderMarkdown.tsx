import { Anchor, Sx, Text, TypographyStylesProvider } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
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
      if (token.type === "html") {
        const hrefRegex = /href="(.+?)"/g;
        let hrefs = token.text.match(hrefRegex);
        if (!hrefs) return token;
        let result: string = token.text;
        if (hrefs.length > 0) {
          hrefs.forEach((href, i) => {
            href = href.replace(/href="/g, "").replace(/"/g, "");
            if (href.startsWith("/")) return token;

            const id = Math.random().toString(36).slice(2);
            result = result.replace(
              href,
              `href="${href}" data-link-id="link-${id}"`
            );

            if (typeof window !== "undefined") {
              const listener = (e: MouseEvent) => {
                const target = document.querySelector(
                  `[data-link-id="link-${id}"]`
                ) as HTMLAnchorElement;
                if (target?.contains(e.target as Node)) {
                  e.preventDefault();
                  openConfirmModal({
                    title: "Confirm link",
                    children: (
                      <>
                        <div className="flex justify-center flex-col gap-2 text-center">
                          <Text size="sm" color="dimmed">
                            Are you sure you want to visit this link?
                          </Text>
                          <Anchor href={href} target="_blank">
                            {href}
                          </Anchor>
                        </div>
                      </>
                    ),
                    labels: { cancel: "Cancel", confirm: "Open link" },
                    onConfirm: () => {
                      window.open(href, "_blank");
                    },
                  });
                }
              };

              document.addEventListener("click", listener);
            }
          });

          token.text = result!;
        }

        return token;
      }
    },
    gfm: true,
    breaks: true,
  });
};

export const proseStyles = clsx(
  "prose text-mantine-text max-w-none dark:prose-invert dark:text-mantine-text-dark",
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
          __html: sanitize(parse(children || ""), {
            allowedAttributes: {
              a: ["href", "data-link-id"],
            },
          }),
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
        className={clsx(proseStyles, proseAddons, props.className)}
        {...Object.fromEntries(
          Object.entries(props).filter(([key]) => key !== "className")
        )}
      />
    </TypographyStylesProvider>
  );
};

export default RenderMarkdown;
