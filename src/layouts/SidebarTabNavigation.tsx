import useMediaQuery from "../util/useMediaQuery";

const SidebarTabNavigation: React.FC<{ children: React.ReactNode }> & {
  Sidebar: (props: {
    children: React.ReactNode;
    customWidth?: number;
  }) => JSX.Element;
  Content: (props: { children: React.ReactNode }) => JSX.Element;
} = ({ children }) => {
  return <div className="flex flex-col md:flex-row gap-8 w-full">{children}</div>;
};

SidebarTabNavigation.Sidebar = ({ children, customWidth }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const mobile = useMediaQuery("768");

  return (
    <div
      className="md:flex md:flex-col md:gap-2 flex-row grid grid-cols-2 gap-2 md:grid-cols-1 md:grid-rows-3"
      {...(!mobile && { style: { width: customWidth || 240 } })}
    >
      {children}
    </div>
  );
};

SidebarTabNavigation.Content = ({ children }) => {
  return <div className="flex-1">{children}</div>;
};

export default SidebarTabNavigation;
