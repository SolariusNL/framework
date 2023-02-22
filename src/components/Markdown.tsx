import { ActionIcon, Skeleton, Tabs, Textarea, Tooltip } from "@mantine/core";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { RiHeading, RiNumber2, RiNumber3, RiNumber4 } from "react-icons/ri";
import {
  VscBold,
  VscCode,
  VscItalic,
  VscLink,
  VscListOrdered,
  VscListTree,
  VscQuestion,
  VscTable,
} from "react-icons/vsc";
import ModernEmptyState from "./ModernEmptyState";
import RenderMarkdown from "./RenderMarkdown";
import ShadedCard from "./ShadedCard";

interface MarkdownProps {
  placeholder?: string;
  toolbar?: Array<ToolbarItem>;
  onChange?: (value: string) => void;
  value?: string;
  error?: string;
}

export enum ToolbarItem {
  Bold,
  Url,
  Italic,
  Code,
  CodeBlock,
  Table,
  BulletList,
  OrderedList,
  H2,
  H3,
  H4,
  Help,
}

const Markdown: React.FC<MarkdownProps> = ({
  placeholder = "Type here...",
  toolbar = [
    ToolbarItem.Bold,
    ToolbarItem.Italic,
    ToolbarItem.Code,
    ToolbarItem.CodeBlock,
    ToolbarItem.Table,
    ToolbarItem.BulletList,
    ToolbarItem.OrderedList,
    ToolbarItem.H2,
    ToolbarItem.H3,
    ToolbarItem.H4,
    ToolbarItem.Url,
    ToolbarItem.Help,
  ],
  onChange,
  value,
  error,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const insertText = (
    left: string,
    right: string,
    selectOnInsert: boolean,
    placeCursorInside: boolean
  ) => {
    const input = inputRef.current;
    if (input) {
      if (input.selectionStart !== input.selectionEnd) {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const selectedText = input.value.substring(start, end);
        const before = input.value.substring(0, start);
        const after = input.value.substring(end, input.value.length);
        input.value = before + left + selectedText + right + after;
        input.selectionStart = input.selectionEnd = start + left.length;

        if (selectOnInsert) {
          input.selectionStart = start + left.length;
          input.selectionEnd = start + left.length + selectedText.length;
        } else if (placeCursorInside) {
          input.selectionStart = start + left.length + selectedText.length;
          input.selectionEnd = start + left.length + selectedText.length;
        }
      } else {
        const before = input.value.substring(0, input.selectionStart);
        const after = input.value.substring(
          input.selectionEnd,
          input.value.length
        );
        input.value = before + left + right + after;
        input.selectionStart = input.selectionEnd =
          input.selectionStart + left.length;

        if (selectOnInsert) {
          input.selectionStart = input.selectionStart - right.length;
          input.selectionEnd = input.selectionEnd - right.length;
        } else if (placeCursorInside) {
          input.selectionStart = input.selectionStart - right.length;
          input.selectionEnd = input.selectionEnd - right.length;
        }
      }

      input.focus();
    }

    if (onChange) onChange(input!.value);
  };

  const getAction = (item: ToolbarItem) => {
    switch (item) {
      case ToolbarItem.Bold:
        return {
          icon: <VscBold />,
          onClick: () => {
            insertText("**", "**", true, false);
          },
          keybind: "B",
          tooltip: "Bold",
        };
      case ToolbarItem.Italic:
        return {
          icon: <VscItalic />,
          onClick: () => {
            insertText("*", "*", true, false);
          },
          keybind: "I",
          tooltip: "Italic",
        };
      case ToolbarItem.Code:
        return {
          icon: <VscCode />,
          onClick: () => {
            insertText("`", "`", true, false);
          },
          keybind: "K",
          tooltip: "Code",
        };
      case ToolbarItem.CodeBlock:
        return {
          icon: <VscCode />,
          onClick: () => {
            insertText("```\n", "\n```", false, true);
          },
          keybind: "J",
          tooltip: "Code Block",
        };
      case ToolbarItem.Table:
        return {
          icon: <VscTable />,
          onClick: () => {
            insertText(
              "| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text     | Text     |\n",
              "",
              false,
              false
            );
          },
          keybind: "T",
          tooltip: "Table",
        };
      case ToolbarItem.BulletList:
        return {
          icon: <VscListTree />,
          onClick: () => {
            insertText("- ", "", false, false);
          },
          keybind: "U",
          tooltip: "Bullet List",
        };
      case ToolbarItem.OrderedList:
        return {
          icon: <VscListOrdered />,
          onClick: () => {
            insertText("1. ", "", false, false);
          },
          keybind: "O",
          tooltip: "Ordered List",
        };
      case ToolbarItem.H3:
        return {
          icon: (
            <div className="flex items-end">
              <RiHeading />
              <RiNumber3 size={10} />
            </div>
          ),
          onClick: () => {
            insertText("### ", "", false, false);
          },
          keybind: "3",
          tooltip: "Heading 3",
        };
      case ToolbarItem.H4:
        return {
          icon: (
            <div className="flex items-end">
              <RiHeading />
              <RiNumber4 size={10} />
            </div>
          ),
          onClick: () => {
            insertText("#### ", "", false, false);
          },
          keybind: "4",
          tooltip: "Heading 4",
        };
      case ToolbarItem.H2:
        return {
          icon: (
            <div className="flex items-end">
              <RiHeading />
              <RiNumber2 size={10} />
            </div>
          ),
          onClick: () => {
            insertText("## ", "", false, false);
          },
          keybind: "2",
          tooltip: "Heading 2",
        };
      case ToolbarItem.Url:
        return {
          icon: <VscLink />,
          onClick: () => {
            insertText("[", "](https://)", true, true);
          },
          keybind: "L",
          tooltip: "Link",
        };
      case ToolbarItem.Help:
        return {
          icon: <VscQuestion />,
          onClick: () => {
            window.open(
              "https://wiki.soodam.rocks/docs/features/markdown",
              "_blank"
            );
          },
          keybind: "H",
          tooltip: "Help",
        };
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      toolbar.forEach((item) => {
        const action = getAction(item);
        if (
          action &&
          action.keybind === e.key.toUpperCase() &&
          (e.metaKey || e.ctrlKey)
        ) {
          e.preventDefault();
          action.onClick();
        }
      });
    };

    const input = inputRef.current;
    const inputKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" && input) {
        e.preventDefault();
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const before = input.value.substring(0, start);
        const after = input.value.substring(end, input.value.length);
        input.value = before + "  " + after;
        input.selectionStart = input.selectionEnd = start + 2;
      }

      // if (e.key === "Enter" && input) {
      //   if (e.shiftKey) return;
      //   e.preventDefault();

      //   const v = input.value;
      //   const lines = v.split("\n");
      //   const lastLine = lines[lines.length - 1];

      //   const BULLET = /^- (.*)/;
      //   const ORDERED = /^\d+\. (.*)/;

      //   if (BULLET.test(lastLine)) {
      //     if (lastLine === "- ") {
      //       input.value = v.substring(0, v.length - 3) + "\n\n";
      //       return;
      //     }
      //     input.value += "\n- ";
      //   } else if (ORDERED.test(lastLine)) {
      //     const lastNumber = parseInt(String(lastLine.match(/^\d+/)));
      //     let nextNumber = lastNumber + 1;

      //     if (lastLine === `${lastNumber}. `) {
      //       input.value = v.substring(0, v.length - 3) + "\n";
      //       return;
      //     }

      //     input.value += "\n" + nextNumber + ". ";
      //   } else {
      //     input.value += "\n";
      //   }
      // }
    };

    document.addEventListener("keydown", handleKeyDown);
    input?.addEventListener("keydown", inputKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      input?.removeEventListener("keydown", inputKeyDown);
    };
  }, [toolbar]);

  return (
    <div>
      <Tabs defaultValue="write" variant="pills">
        <Tabs.List className="flex justify-between items-start mb-4 flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Tabs.Tab value="write">Write</Tabs.Tab>
            <Tabs.Tab value="preview">Preview</Tabs.Tab>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
            {toolbar.map((item) => (
              <Tooltip label={getAction(item)!.tooltip!} key={item}>
                <ActionIcon
                  onClick={
                    getAction(item)!
                      .onClick as React.MouseEventHandler<HTMLButtonElement>
                  }
                >
                  {getAction(item)!.icon!}
                </ActionIcon>
              </Tooltip>
            ))}
          </div>
        </Tabs.List>
        <Tabs.Panel value="write">
          <Textarea
            ref={inputRef}
            placeholder={placeholder}
            onChange={(e) => {
              if (onChange) onChange(e.currentTarget.value);
            }}
            value={value}
            minRows={5}
            styles={(theme) => ({
              input: {
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? "black"
                    : "white" + "!important",
                fontFamily: "Fira Code VF, monospace !important",
              },
            })}
            error={error}
          />
        </Tabs.Panel>
        <Tabs.Panel value="preview">
          {value ? (
            <ShadedCard>
              <RenderMarkdown>{value}</RenderMarkdown>
            </ShadedCard>
          ) : (
            <ShadedCard className="w-full flex items-center justify-center py-4">
              <ModernEmptyState
                title="No preview available"
                body="Write something to see the preview"
              />
            </ShadedCard>
          )}
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default dynamic(() => Promise.resolve(Markdown), {
  ssr: false,
  loading: () => <Skeleton height={200} />,
});
