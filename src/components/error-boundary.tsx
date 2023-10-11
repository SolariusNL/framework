import clsx from "@/util/clsx";
import { Button, Code, Text, Title } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { Component, ErrorInfo, ReactNode } from "react";
import {
  HiOutlineExclamation,
  HiOutlineRefresh,
  HiOutlineTag,
} from "react-icons/hi";
import ModernEmptyState from "./modern-empty-state";
import ShadedCard from "./shaded-card";

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
    this.setState({
      ...this.state,
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <main className="flex flex-col px-2 items-center justify-center w-full max-w-2xl mx-auto">
          <ShadedCard
            withBorder
            radius={0}
            className={clsx(
              "text-center md:py-24 sm:py-12 py-8 items-center flex flex-col",
              "min-h-screen w-full !border-t-0 !border-b-0"
            )}
          >
            <Title order={2}>
              An exception caused Framework to stop working.
            </Title>
            <Text size="sm" color="dimmed" mt="sm">
              We are sorry for the inconvenience. Please see the detailed
              exception report below, which you can save and send to Solarius
              for further investigation.
            </Text>
            <Title order={3} mt="xl" mb="sm">
              <Code>error</Code> object properties
            </Title>
            {this.state.error &&
            this.state.error instanceof Error &&
            JSON.stringify(this.state.error) !== "{}" ? (
              <div className="flex flex-col gap-4">
                {Object.entries(this.state.error).map(([key, value]) => (
                  <div
                    className="flex gap-2 items-start md:flex-row flex-col"
                    key={key}
                  >
                    <Text
                      weight={500}
                      size="sm"
                      color="dimmed"
                      className="flex items-center gap-2 flex-shrink-0 md:w-[25%] w-full"
                    >
                      <HiOutlineTag />
                      {key}
                    </Text>
                    <Text
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      className="md:max-w-[75%] max-w-full"
                      size="sm"
                    >
                      {value}
                    </Text>
                  </div>
                ))}
              </div>
            ) : (
              <ModernEmptyState
                title="No error object"
                body="The internal error object is not available."
              />
            )}
            <Title order={3} mt="xl" mb="sm">
              Stack trace
            </Title>
            {this.state.errorInfo && this.state.errorInfo.componentStack ? (
              <Prism
                language="json"
                withLineNumbers
                className={clsx(
                  "text-start",
                  "overflow-x-auto w-full max-w-2xl"
                )}
              >
                {this.state.errorInfo.componentStack}
              </Prism>
            ) : (
              <ModernEmptyState
                title="No stack trace"
                body="The internal stack trace is not available."
              />
            )}
            <div className="flex justify-end mt-4 gap-2 text-center w-full">
              <Button
                variant="light"
                color="gray"
                radius="xl"
                leftIcon={<HiOutlineRefresh />}
                onClick={() => window.location.reload()}
              >
                Refresh route
              </Button>
              <Button
                variant="light"
                color="red"
                radius="xl"
                leftIcon={<HiOutlineExclamation />}
                onClick={() => this.setState({ hasError: false })}
              >
                Dismiss
              </Button>
            </div>
          </ShadedCard>
        </main>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
