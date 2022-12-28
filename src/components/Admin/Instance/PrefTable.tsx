import { Button, Table, Text, TextInput } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { AdminPermission } from "@prisma/client";
import { useEffect, useState } from "react";
import { HiExclamationCircle } from "react-icons/hi";
import { useFrameworkUser } from "../../../contexts/FrameworkUser";

interface PrefTableProps {
  data: Map<string, string>;
  editable?: boolean;
  onEditButtonClick?: (key: string) => void;
  onEditSubmit?: (key: string, value: string) => void;
}

const PrefTable: React.FC<PrefTableProps> = ({
  data,
  editable = false,
  onEditButtonClick,
  onEditSubmit,
}) => {
  const [dataState, setDataState] = useState<Map<string, string>>(new Map());
  const u = useFrameworkUser()!;

  useEffect(() => {
    setDataState(data);
  }, [data]);

  return (
    <Table highlightOnHover>
      <tbody>
        {Array.from(dataState).map(([key, value]) => (
          <tr key={key}>
            <td>{key}</td>
            <td>
              <div className="flex items-center gap-4">
                {value}
                {editable && (
                  <Button
                    compact
                    variant="white"
                    disabled={
                      !u.adminPermissions.includes(
                        AdminPermission.CHANGE_INSTANCE_SETTINGS
                      )
                    }
                    onClick={() => {
                      if (onEditButtonClick) {
                        onEditButtonClick(key);
                      } else {
                        const previousValue = value;
                        let updated = value;

                        openConfirmModal({
                          title: "Editing " + key,
                          children: (
                            <>
                              <Text mb={16}>
                                Enter the new value for {key} in the field
                                below. Note that this change will be applied
                                immediately and may come with unintended
                                consequences if not done correctly.
                              </Text>
                              <TextInput
                                defaultValue={value}
                                onChange={(e) => {
                                  updated = e.currentTarget.value;
                                  console.log(updated);
                                }}
                              />
                            </>
                          ),
                          labels: { confirm: "Save", cancel: "Cancel" },
                          onConfirm: () => {
                            if (onEditSubmit) {
                              onEditSubmit(key, updated);
                              setDataState(
                                new Map(dataState.set(key, updated))
                              );
                            }
                          },
                          onCancel: () => {
                            setDataState(
                              new Map(dataState.set(key, previousValue))
                            );
                          },
                        });
                      }
                    }}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </td>
          </tr>
        ))}
        <tr>
          <td colSpan={2}>
            <div className="flex items-center gap-4">
              <HiExclamationCircle className="text-orange-500 flex-shrink-0" />
              <Text color="orange">
                You must rebuild the instance for changes to take effect,
                because environment variables are read at build time.
              </Text>
            </div>
          </td>
        </tr>
      </tbody>
    </Table>
  );
};

export default PrefTable;
