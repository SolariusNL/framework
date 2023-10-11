import clsx from "@/util/clsx";
import { Button, Text, Title } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { Component, ErrorInfo, ReactNode } from "react";
import {
  HiOutlineExclamation,
  HiOutlineRefresh,
  HiOutlineTag,
} from "react-icons/hi";
import DataGrid from "./data-grid";
import ModernEmptyState from "./modern-empty-state";
import ShadedCard from "./shaded-card";

type Props = {
  children?: ReactNode;
};

type State = {
  hasError: boolean;
  errorInfo?: ErrorInfo;
  message?: string;
  name?: string;
};

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorInfo: undefined,
    message: undefined,
    name: undefined,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      ...this.state,
      errorInfo,
      message: error.message,
      name: error.name,
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
            <Text size="sm" color="dimmed" mt="sm" mb="xl">
              We are sorry for the inconvenience. Please see the detailed
              exception report below, which you can save and send to Solarius
              for further investigation.
            </Text>
            <DataGrid
              className="!mt-0"
              mdCols={1}
              smCols={1}
              defaultCols={1}
              items={[
                {
                  tooltip: "name",
                  icon: <HiOutlineTag />,
                  value: this.state.name,
                  hoverTip:
                    "The name of the error - usually the name of the exception class",
                },
                {
                  tooltip: "message",
                  icon: <HiOutlineTag />,
                  value: this.state.message,
                  hoverTip: "The error message - should be human-readable",
                },
              ]}
            />
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
