import { useMantineTheme } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import clsx from "../../util/clsx";

type IntegratedTabsProps = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

type IntegratedTabsTabProps = {
  children: string;
  icon: React.ReactNode;
  href: string;
  right?: boolean;
};

const IntegratedTabs: React.FC<IntegratedTabsProps> & {
  Tab: React.FC<IntegratedTabsTabProps>;
} = (props) => {
  return (
    <nav
      className="flex md:space-x-4 w-full md:flex-row flex-col"
      aria-label="Tabs"
      {...props}
    >
      {props.children}
    </nav>
  );
};

IntegratedTabs.Tab = (props) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const theme = useMantineTheme();

  return (
    <Link href={props.href} passHref>
      <a
        className={clsx(
          "px-3 py-2 font-medium text-sm rounded-lg",
          "no-underline flex items-center gap-2",
          props.right ? "md:!ml-auto" : undefined
        )}
        aria-current={router.pathname === props.href ? "page" : undefined}
        style={{
          color:
            router.pathname === props.href
              ? theme.colors.blue[1]
              : theme.colorScheme === "dark"
              ? theme.colors.gray[2]
              : theme.colors.gray[6],
          backgroundColor:
            router.pathname === props.href
              ? theme.colors.blue[9]
              : "transparent",
        }}
      >
        {props.icon}
        {props.children}
      </a>
    </Link>
  );
};

export default IntegratedTabs;
