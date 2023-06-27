import ModernEmptyState from "@/components/ModernEmptyState";
import useMediaQuery from "@/util/media-query";
import { Alert, Button } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import React from "react";
import { HiCheckCircle, HiOutlineSaveAs, HiXCircle } from "react-icons/hi";

interface SettingsTabProps {
  tabValue: string;
  tabTitle: string;
  saveButtonLabel?: string;
  saveButtonAction?: (
    setLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
  ) => void;
  children?: React.ReactNode;
  unavailable?: boolean;
  success?: boolean;
  setSuccess?: (success: boolean) => void;
  unsaved?: boolean;
}

const SettingsTab = ({
  tabValue,
  tabTitle,
  saveButtonLabel,
  saveButtonAction,
  children,
  unavailable,
  success,
  setSuccess,
  unsaved,
}: SettingsTabProps) => {
  const mobile = useMediaQuery("768");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  return (
    <>
      {children}
      {unavailable && (
        <ModernEmptyState
          title="Feature unavailable"
          body="This feature is not yet available."
        />
      )}

      {saveButtonLabel && (
        <>
          {error && (
            <Alert
              mt={25}
              icon={<HiXCircle size="24" />}
              title="Error"
              color="red"
            >
              {error || "An error occurred"}
            </Alert>
          )}

          {success && (
            <Alert
              mt={25}
              icon={<HiCheckCircle size="24" />}
              title="Success"
              color="green"
              onClose={() => {
                if (setSuccess) {
                  setSuccess(false);
                }
              }}
              withCloseButton
            >
              Settings saved successfully
            </Alert>
          )}

          <div className="flex justify-end mt-6">
            <Button
              leftIcon={<HiOutlineSaveAs />}
              onClick={() => {
                if (saveButtonAction) {
                  saveButtonAction(setLoading, setError);
                  showNotification({
                    title: "Settings saved",
                    message: "Your settings have been saved.",
                    icon: <HiCheckCircle />,
                  });
                }
              }}
              loading={loading}
              size="lg"
            >
              {saveButtonLabel}
            </Button>
          </div>
        </>
      )}
    </>
  );
};

export default SettingsTab;
