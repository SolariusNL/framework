import React from "react";

interface StatefulProps {
  children: (
    state: any,
    setState: React.Dispatch<React.SetStateAction<any>>
  ) => JSX.Element;
}

const Stateful = ({ children }: StatefulProps) => {
  const [state, setState] = React.useState(null);
  return children(state, setState);
};

export default Stateful;
