import { Title } from "@mantine/core";
import { Component, ErrorInfo, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
};

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: undefined,
    errorInfo: undefined,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      ...this.state,
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <>
          <Title>An exception caused Framework to stop working.</Title>
          {JSON.stringify(this.state)}
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
