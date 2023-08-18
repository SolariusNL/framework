import { FC, ReactNode } from "react";

type ConditionalProps = {
  if: boolean | any;
  children: ReactNode;
};

/**
 * A component that renders its children if the `if` prop is truthy.
 *
 * @deprecated Do not use this component
 */
const Conditional: FC<ConditionalProps> = ({ if: condition, children }) => {
  const shouldRender =
    typeof condition === "boolean" ? condition : condition !== undefined;
  return <>{shouldRender ? children : null}</>;
};

type ElseProps = {
  children: ReactNode;
};

const Else: FC<ElseProps> = ({ children }) => {
  return <>{children}</>;
};

interface ConditionalComponent extends FC<ConditionalProps> {
  Else: FC<ElseProps>;
}

const ExtendedConditional: ConditionalComponent = Object.assign(Conditional, {
  Else,
});

export default ExtendedConditional;
