import clsx from "clsx";
import { proseStyles } from "./RenderMarkdown";

type ProseProps = {
  as?: React.ElementType;
  className?: string;
};

const Prose: React.FC<ProseProps> = ({
  as: Component = "div",
  className,
  ...props
}) => {
  return <Component className={proseStyles} {...props} />;
};

export default Prose;
