import { Anchor, AnchorProps, Divider } from "@mantine/core";
import Link from "next/link";

const MdxComponents = {
  a: (
    props: React.DetailedHTMLProps<
      React.AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    >
  ) => (
    <Link href={String(props.href)}>
      <Anchor {...(props as AnchorProps)} />
    </Link>
  ),
  hr: () => <Divider />,
};

export default MdxComponents;
