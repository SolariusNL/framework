import {
  ActionIcon,
  Tabs,
  Textarea,
  Tooltip,
  TypographyStylesProvider,
} from "@mantine/core";
import { marked } from "marked";
import { useEffect, useRef } from "react";
import { BiHeading } from "react-icons/bi";
import {
  VscBold,
  VscCode,
  VscItalic,
  VscListOrdered,
  VscListTree,
  VscTable,
} from "react-icons/vsc";
import ModernEmptyState from "./ModernEmptyState";
import ShadedCard from "./ShadedCard";

interface MarkdownProps {
  placeholder?: string;
  toolbar?: Array<ToolbarItem>;
  onChange?: (value: string) => void;
  value?: string;
}

export enum ToolbarItem {
  Bold,
  Url,
  Italic,
  Mention,
  Code,
  CodeBlock,
  Table,
  BulletList,
  OrderedList,
  H3,
  H4,
  H5,
  H6,
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
    ToolbarItem.H3,
    ToolbarItem.H4,
    ToolbarItem.H5,
    ToolbarItem.H6,
  ],
  onChange,
  value,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const insertText = (left: string, right: string) => {
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
      } else {
        const before = input.value.substring(0, input.selectionStart);
        const after = input.value.substring(
          input.selectionEnd,
          input.value.length
        );
        input.value = before + left + right + after;
        input.selectionStart = input.selectionEnd =
          input.selectionStart + left.length;
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
            insertText("**", "**");
          },
          keybind: "B",
          tooltip: "Bold",
        };
      case ToolbarItem.Italic:
        return {
          icon: <VscItalic />,
          onClick: () => {
            insertText("*", "*");
          },
          keybind: "I",
          tooltip: "Italic",
        };
      case ToolbarItem.Code:
        return {
          icon: <VscCode />,
          onClick: () => {
            insertText("`", "`");
          },
          keybind: "K",
          tooltip: "Code",
        };
      case ToolbarItem.CodeBlock:
        return {
          icon: <VscCode />,
          onClick: () => {
            insertText("```\n", "\n```");
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
              ""
            );
          },
          keybind: "T",
          tooltip: "Table",
        };
      case ToolbarItem.BulletList:
        return {
          icon: <VscListTree />,
          onClick: () => {
            insertText("- ", "");
          },
          keybind: "U",
          tooltip: "Bullet List",
        };
      case ToolbarItem.OrderedList:
        return {
          icon: <VscListOrdered />,
          onClick: () => {
            insertText("1. ", "");
          },
          keybind: "O",
          tooltip: "Ordered List",
        };
      case ToolbarItem.H3:
        return {
          icon: <BiHeading />,
          onClick: () => {
            insertText("### ", "");
          },
          keybind: "3",
          tooltip: "Heading 3",
        };
      case ToolbarItem.H4:
        return {
          icon: <BiHeading />,
          onClick: () => {
            insertText("#### ", "");
          },
          keybind: "4",
          tooltip: "Heading 4",
        };
      case ToolbarItem.H5:
        return {
          icon: <BiHeading />,
          onClick: () => {
            insertText("##### ", "");
          },
          keybind: "5",
          tooltip: "Heading 5",
        };
      case ToolbarItem.H6:
        return {
          icon: <BiHeading />,
          onClick: () => {
            insertText("###### ", "");
          },
          keybind: "6",
          tooltip: "Heading 6",
        };
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      toolbar.forEach((item) => {
        const action = getAction(item);
        if (action && action.keybind === e.key.toUpperCase() && e.metaKey) {
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
              },
            })}
          />
        </Tabs.Panel>
        <Tabs.Panel value="preview">
          {value ? (
            <ShadedCard>
              <TypographyStylesProvider>
                <div
                  dangerouslySetInnerHTML={{ __html: marked(value || "") }}
                />
              </TypographyStylesProvider>
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

export default Markdown;
