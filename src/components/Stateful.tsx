import React from "react";

interface StatefulProps {
  children: (
    state: any,
    setState: React.Dispatch<React.SetStateAction<any>>
  ) => React.ReactNode;
  initialState?: any;
  effect?: (value?: any) => void;
}

const Stateful = ({ children, initialState, effect }: StatefulProps) => {
  const [state, setState] = React.useState(initialState || null);

  React.useEffect(() => {
    if (effect) {
      effect(state);
    }
  }, [state]);

  return <>{children(state, setState)}</>;
};

export default Stateful;
