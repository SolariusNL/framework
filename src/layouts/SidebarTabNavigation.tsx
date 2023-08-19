import clsx from "@/util/clsx";
import useMediaQuery from "@/util/media-query";

const SidebarTabNavigation: React.FC<{
  children: React.ReactNode;
  customGap?: number;
}> & {
  Sidebar: (props: {
    children: React.ReactNode;
    customWidth?: number;
    className?: string;
  }) => JSX.Element;
  Content: (props: {
    children: React.ReactNode;
    className?: string;
  }) => JSX.Element;
} = ({ children, customGap }) => {
  return (
    <div
      className={clsx(
        "flex flex-col md:flex-row w-full",
        customGap ? `gap-${customGap}` : "gap-8"
      )}
    >
      {children}
    </div>
  );
};

SidebarTabNavigation.Sidebar = ({ children, customWidth, className }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const mobile = useMediaQuery("768");

  return (
    <div
      className={clsx(
        "md:flex md:flex-col md:gap-2 flex-row grid grid-cols-2 gap-2 md:grid-cols-1 md:grid-rows-3",
        className
      )}
      {...(!mobile && { style: { width: customWidth || 240 } })}
    >
      {children}
    </div>
  );
};

SidebarTabNavigation.Content = ({ children, className }) => {
  return <div className={clsx("flex-1", className)}>{children}</div>;
};

export default SidebarTabNavigation;
