import Copy from "@/components/copy";
import Dot from "@/components/dot";
import { databaseTags } from "@/pages/developer/redis";
import SSRLoader from "@/ssr-loader";
import useRedis from "@/stores/useRedis";
import buildTenantUrl from "@/util/tenant";
import {
  ActionIcon,
  Anchor,
  ScrollArea,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { FC } from "react";
import { HiArrowLeft, HiOutlineDatabase, HiOutlineLink } from "react-icons/hi";

const viewTabs: Record<string, string> = {
  details: "Details",
  usage: "Usage",
  cli: "CLI",
  data: "Data browser",
  settings: "Settings",
};

const SelectedDatabaseView: FC = () => {
  const { selectedDatabase, clearSelectedDatabase } = useRedis();

  return selectedDatabase !== null ? (
    <>
      <div className="flex items-start gap-5">
        <div className="flex items-center md:gap-6 gap-2">
          <ActionIcon
            onClick={() => {
              clearSelectedDatabase();
            }}
            size="xl"
            className="rounded-full hover:border-zinc-500/50 transition-all"
            sx={{
              borderWidth: 1,
            }}
          >
            <HiArrowLeft />
          </ActionIcon>
          <HiOutlineDatabase size={32} />
        </div>
        <div className="flex flex-col md:gap-0 gap-2">
          <div className="flex items-center gap-3">
            <Dot pulse />
            <Title order={3}>{selectedDatabase.name}</Title>
          </div>
          {databaseTags(selectedDatabase)}
        </div>
      </div>
      <Tabs variant="default" defaultValue="details" className="mt-4">
        <ScrollArea className="mb-3" type="never">
          <Tabs.List>
            {Object.keys(viewTabs).map((k, i) => (
              <Tabs.Tab key={i} value={k}>
                {viewTabs[k]}
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </ScrollArea>
        <Tabs.Panel value="details">
          <div className="flex items-center gap-2">
            <Text
              size="sm"
              color="dimmed"
              className="flex items-center gap-1 truncate text-ellipsis"
            >
              <HiOutlineLink className="flex-shrink-0" />
              Connection URL
              <Anchor>
                {buildTenantUrl(selectedDatabase.tenantPhrase, {
                  protocol: "https",
                  port: 6379,
                })}
              </Anchor>
            </Text>
            <Copy
              value={buildTenantUrl(selectedDatabase.tenantPhrase, {
                protocol: "https",
                port: 6379,
              })}
            />
          </div>
        </Tabs.Panel>
      </Tabs>
    </>
  ) : (
    SSRLoader
  );
};

export default SelectedDatabaseView;
