import React from "react";

interface StatefulProps {
  children: (
    state: any,
    setState: React.Dispatch<React.SetStateAction<any>>
  ) => React.ReactNode;
  initialState?: any;
}

const Stateful = ({ children, initialState }: StatefulProps): JSX.Element => {
  const [state, setState] = React.useState(initialState || null);
  return <>{children(state, setState)}</>;
};

export default Stateful;
