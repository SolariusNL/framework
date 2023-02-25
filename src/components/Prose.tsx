import { proseStyles } from "./RenderMarkdown";

type ProseProps = {
  as?: React.ElementType;
  className?: string;
  render?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

const Prose: React.FC<ProseProps> = ({
  as: Component = "div",
  className,
  render,
  ...props
}) => {
  return (
    <Component className={proseStyles} {...props}>
      {props.children}
    </Component>
  );
};

export default Prose;
