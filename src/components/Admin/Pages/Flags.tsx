import {
  Badge,
  Button,
  Checkbox,
  Group,
  JsonInput,
  Modal,
  MultiSelect,
  NumberInput,
  Text,
  TextInput,
  useMantineColorScheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { AdminPermission } from "@prisma/client";
import { FC, useState } from "react";
import {
  HiCheck,
  HiCheckCircle,
  HiFlag,
  HiPencil,
  HiSearch,
} from "react-icons/hi";
import { GenericFastFlag } from "../../../pages/api/flags/[[...params]]";
import { BLACK } from "../../../pages/teams/t/[slug]/issue/create";
import useAuthorizedUserStore from "../../../stores/useAuthorizedUser";
import useFastFlags, { FLAGS } from "../../../stores/useFastFlags";
import IResponseBase from "../../../types/api/IResponseBase";
import fetchJson from "../../../util/fetch";
import Descriptive from "../../Descriptive";
import ModernEmptyState from "../../ModernEmptyState";
import SideBySide from "../../Settings/SideBySide";

const Flags: FC = () => {
  const { rawFlags: flags, setRawFlags } = useFastFlags();
  const { user } = useAuthorizedUserStore();
  const [editing, setEditing] = useState<GenericFastFlag>();
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState("");

  const setEditingValue = (value: string) => {
    setEditing(
      (prev) =>
        prev && {
          ...prev,
          value,
        }
    );
  };

  const updateFlags = async (flags: GenericFastFlag[]): Promise<void> => {
    setRawFlags(flags);

    await fetchJson<IResponseBase>("/api/flags", {
      method: "POST",
      auth: true,
      body: flags as Record<string, any>,
    }).then((res) => {
      if (res.success) {
        showNotification({
          title: "Success",
          message: "Flags updated.",
          icon: <HiCheckCircle />,
        });
      }
    });
  };

  return (
    <>
      <Modal
        title={`Editing ${editing?.name}`}
        opened={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditing(undefined);
        }}
        className={useMantineColorScheme().colorScheme}
      >
        {editing && (
          <>
            <Text size="sm" color="dimmed" mb="sm">
              You are editing a fast flag which takes immediate effect and can
              have detrimental effects on the user experience if misconfigured.
              Please be careful.
            </Text>
            <Text size="sm" color="dimmed" mb="lg" weight={500}>
              {String(FLAGS.find((f) => f.name === editing.name)?.description)}
            </Text>
            {editing.valueType === "BOOLEAN" ? (
              <Descriptive
                title="Value"
                description="Whether the flag is enabled or disabled."
              >
                <Checkbox
                  checked={editing.value === "true"}
                  onChange={(e) => {
                    setEditingValue(String(e.currentTarget.checked));
                  }}
                  classNames={BLACK}
                  label="Enabled"
                />
              </Descriptive>
            ) : editing.valueType === "ARRAY" ? (
              <MultiSelect
                label="Value"
                placeholder="Enter information"
                description="The values of the array."
                classNames={BLACK}
                creatable
                getCreateLabel={(query) => `+ Create ${query}`}
                onCreate={(query) => {
                  const item = { value: `"${query}"`, label: query };
                  setEditingValue(
                    editing.value === "[]"
                      ? item.value
                      : `${editing.value}, ${item.value}`
                  );
                  return item;
                }}
                data={editing.value
                  .replace("[", "")
                  .replace("]", "")
                  .split(", ")
                  .map((item) => ({ value: item, label: item }))}
                value={
                  editing.value === "[]"
                    ? []
                    : editing.value
                        .replace("[", "")
                        .replace("]", "")
                        .split(", ")
                }
                onChange={(value) => {
                  setEditingValue(`[${value.map((v) => v).join(", ")}]`);
                }}
                searchable
              />
            ) : editing.valueType === "OBJECT" ? (
              <JsonInput
                description="The value of the object."
                label="Value"
                placeholder="Enter value"
                classNames={BLACK}
                styles={{
                  input: {
                    fontFamily: "Fira Code VF !important",
                  },
                }}
                minRows={5}
                value={editing.value}
                onChange={(value) => setEditingValue(value)}
              />
            ) : editing.valueType === "NUMBER" ? (
              <NumberInput
                value={Number(editing.value)}
                onChange={(value) => setEditingValue(String(value))}
                description="The value of the number."
                label="Value"
                placeholder="Enter value"
                classNames={BLACK}
              />
            ) : (
              <TextInput
                value={editing.value}
                onChange={(e) => setEditingValue(e.currentTarget.value)}
                description="The value of the string."
                label="Value"
                placeholder="Enter value"
                classNames={BLACK}
              />
            )}
          </>
        )}
        <div className="flex justify-end mt-4">
          <Button
            leftIcon={<HiCheck />}
            onClick={() => {
              updateFlags(
                flags.map((flag) =>
                  flag.name === editing?.name ? editing : flag
                ) as GenericFastFlag[]
              );
              setEditOpen(false);
            }}
          >
            Save changes
          </Button>
        </div>
      </Modal>
      {user?.adminPermissions.includes(AdminPermission.EDIT_FAST_FLAGS) ? (
        <>
          <Group>
            <TextInput
              classNames={BLACK}
              placeholder="Search for a flag"
              icon={<HiSearch />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              className="md:flex-[0.4] flex-1"
            />
          </Group>
          <div className="flex flex-col mt-10">
            {flags
              .filter((flag) =>
                flag.name.toLowerCase().includes(search.toLowerCase())
              )
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((flag, i) => (
                <SideBySide
                  title={flag.name}
                  description={String(
                    FLAGS.find((f) => f.name === flag.name)?.description
                  )}
                  icon={<HiFlag />}
                  actions={
                    <Button
                      leftIcon={<HiPencil />}
                      onClick={() => {
                        setEditing(flag);
                        setEditOpen(true);
                      }}
                    >
                      Configure flag
                    </Button>
                  }
                  shaded
                  right={
                    <>
                      <Text
                        size="sm"
                        color="dimmed"
                        className="w-full"
                        mb="md"
                        align="center"
                      >
                        Value
                      </Text>
                      <div className="flex items-center text-center justify-center">
                        <Text size="lg" weight={500} className="w-full">
                          {flag.valueType === "ARRAY" ? (
                            flag.value !== "[]" ? (
                              `Array (${flag.value.split(", ").length} items)`
                            ) : (
                              <span className="text-dimmed">No data</span>
                            )
                          ) : flag.valueType === "BOOLEAN" ? (
                            <Badge
                              size="lg"
                              color={flag.value === "true" ? "green" : "red"}
                            >
                              {flag.value === "true" ? "Enabled" : "Disabled"}
                            </Badge>
                          ) : flag.valueType === "NUMBER" ? (
                            flag.value
                          ) : flag.valueType === "OBJECT" ? (
                            <pre className="text-start font-monos">
                              {JSON.stringify(JSON.parse(flag.value), null, 2)}
                            </pre>
                          ) : (
                            flag.value
                          )}
                        </Text>
                      </div>
                    </>
                  }
                  key={flag.name}
                  noUpperBorder={i === 0}
                />
              ))}
          </div>
        </>
      ) : (
        <ModernEmptyState
          title="No access"
          body="You don't have access to this page. Please contact an administrator."
        />
      )}
    </>
  );
};

export default Flags;
