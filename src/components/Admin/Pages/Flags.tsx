import { Badge, Button, Group, Text, TextInput } from "@mantine/core";
import { AdminPermission } from "@prisma/client";
import { FC, useState } from "react";
import { HiFlag, HiPencil, HiSearch } from "react-icons/hi";
import { BLACK } from "../../../pages/teams/t/[slug]/issue/create";
import useAuthorizedUserStore from "../../../stores/useAuthorizedUser";
import useFastFlags, { FLAGS } from "../../../stores/useFastFlags";
import ModernEmptyState from "../../ModernEmptyState";
import SideBySide from "../../Settings/SideBySide";

const Flags: FC = () => {
  const { rawFlags: flags } = useFastFlags();
  const { user } = useAuthorizedUserStore();
  const [search, setSearch] = useState("");

  return (
    <>
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
              .map((flag, i) => (
                <SideBySide
                  title={flag.name}
                  description={String(
                    FLAGS.find((f) => f.name === flag.name)?.description
                  )}
                  classNames={{
                    title: "font-mono flex items-center",
                  }}
                  icon={<HiFlag />}
                  actions={
                    <Button leftIcon={<HiPencil />}>Configure flag</Button>
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
                              Array(flag.value).join(", ")
                            ) : (
                              <span className="text-dimmed">No data</span>
                            )
                          ) : flag.valueType === "BOOLEAN" ? (
                            <Badge
                              size="lg"
                              color={flag.value ? "green" : "reed"}
                            >
                              {flag.value ? "Enabled" : "Disabled"}
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
