import { Affix, Menu, useMantineColorScheme } from "@mantine/core";
import { useWindowEvent } from "@mantine/hooks";
import { useState } from "react";
import clsx from "../util/clsx";

type ContextMenuProps = {
  children: React.ReactNode;
  dropdown: React.ReactNode;
  width?: number;
  className?: string;
};

const ContextMenu: React.FC<ContextMenuProps> = ({
  children,
  dropdown,
  width,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { colorScheme } = useMantineColorScheme();

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setPosition({ x: event.clientX, y: event.clientY });
    setIsOpen(true);
  };

  const handleMenuClose = () => {
    setIsOpen(false);
  };

  useWindowEvent("resize", () => {
    setIsOpen(false);
  });

  return (
    <Menu
      opened={isOpen}
      onClose={handleMenuClose}
      withinPortal={false}
      width={width || 120}
      transitionDuration={0}
      styles={(theme) => ({
        dropdown: {
          top: "0 !important",
          left: "0 !important",
          background: colorScheme === "dark" ? "#000" : "#FFF",
          border: "0",
          boxShadow: `0 8px 16px ${
            colorScheme === "dark" ? theme.colors.dark[9] : theme.colors.gray[3]
          } !important`,
        },
        divider: {
          borderTop:
            "1px solid " +
            (colorScheme === "dark"
              ? theme.colors.dark[7]
              : theme.colors.gray[2]) +
            "!important",
        },
      })}
      classNames={{
        dropdown: clsx(
          colorScheme === "dark" ? "highlight-zinc-800" : "highlight-gray-200"
        ),
      }}
    >
      <Menu.Target>
        <div onContextMenu={handleContextMenu} className={className}>
          {children}
        </div>
      </Menu.Target>
      <Affix
        position={{
          top: position.y,
          left: position.x,
        }}
        sx={{
          position: "fixed",
          zIndex: 1000,
        }}
      >
        <Menu.Dropdown>{dropdown}</Menu.Dropdown>
      </Affix>
    </Menu>
  );
};

export default ContextMenu;
