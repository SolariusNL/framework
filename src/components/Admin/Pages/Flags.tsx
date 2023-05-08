import { Badge, Group, Text, TextInput, Title } from "@mantine/core";
import { AdminPermission, FastFlagUnionType } from "@prisma/client";
import { FC, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { BLACK } from "../../../pages/teams/t/[slug]/issue/create";
import useAuthorizedUserStore from "../../../stores/useAuthorizedUser";
import useFastFlags from "../../../stores/useFastFlags";
import clsx from "../../../util/clsx";
import ModernEmptyState from "../../ModernEmptyState";
import ShadedButton from "../../ShadedButton";

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
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4 mt-6">
            {flags
              .filter((flag) =>
                flag.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((flag) => (
                <ShadedButton key={flag.name} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between w-full">
                    <Title order={4} className="!font-mono">
                      {flag.name}{" "}
                    </Title>
                    <Badge>{flag.valueType}</Badge>
                  </div>
                  {flag.valueType === FastFlagUnionType.ARRAY ? (
                    <div className="grid grid-cols-2">
                      {JSON.parse(flag.value).map((value: string) => (
                        <Text
                          size="sm"
                          color="dimmed"
                          key={value}
                          className="!font-mono"
                        >
                          {value}
                        </Text>
                      ))}
                      {JSON.parse(flag.value).length === 0 && (
                        <Text size="sm" color="dimmed" className="!font-mono">
                          No values
                        </Text>
                      )}
                    </div>
                  ) : flag.valueType === FastFlagUnionType.BOOLEAN ? (
                    <Text
                      size="sm"
                      color={Boolean(flag.value) ? "green" : "red"}
                      className={clsx("!font-mono")}
                    >
                      {Boolean(flag.value).toString()}
                    </Text>
                  ) : (
                    <Text size="sm" color="dimmed" className="!font-mono">
                      {flag.value}
                    </Text>
                  )}
                </ShadedButton>
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
