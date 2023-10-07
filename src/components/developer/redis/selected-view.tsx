import Copy from "@/components/copy";
import Dot from "@/components/dot";
import InlineError from "@/components/inline-error";
import SideBySide from "@/components/settings/side-by-side";
import SSRLoader from "@/components/ssr-loader";
import { databaseTags } from "@/pages/developer/redis";
import useRedis from "@/stores/useRedis";
import IResponseBase from "@/types/api/IResponseBase";
import fetchJson from "@/util/fetch";
import buildTenantUrl from "@/util/tenant";
import {
  ActionIcon,
  Anchor,
  Button,
  ScrollArea,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { FC } from "react";
import {
  HiArrowLeft,
  HiCheckCircle,
  HiOutlineDatabase,
  HiOutlineLink,
  HiOutlineTrash,
  HiTrash,
  HiXCircle,
} from "react-icons/hi";

const viewTabs: Record<string, string> = {
  details: "Details",
  usage: "Usage",
  cli: "CLI",
  data: "Data browser",
  settings: "Settings",
};

const SelectedDatabaseView: FC = () => {
  const { selectedDatabase, refetch, setOpened } = useRedis();

  const deleteDatabase = async () => {
    await fetchJson<IResponseBase>(
      `/api/redis/database/${selectedDatabase!.id}`,
      {
        method: "DELETE",
        auth: true,
      }
    )
      .then((res) => {
        if (res.success) {
          setOpened(false);
          showNotification({
            title: "Database deleted",
            message: "The database has been deleted successfully.",
            icon: <HiCheckCircle />,
          });
        } else {
          showNotification({
            title: "Error",
            message: res.message || "An unknown error occurred.",
            icon: <HiXCircle />,
            color: "red",
          });
        }
      })
      .finally(refetch);
  };

  return selectedDatabase !== null ? (
    <>
      <div className="flex items-start gap-5">
        <div className="flex items-center md:gap-6 gap-2">
          <ActionIcon
            onClick={() => {
              setOpened(false);
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
          {!selectedDatabase!.tenantPhrase && (
            <InlineError
              variant="warning"
              title="Provisioning error"
              className="mb-2"
            >
              This database has not been provisioned correctly. Please contact
              Solarius for assistance.
            </InlineError>
          )}
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
        <Tabs.Panel value="settings">
          <SideBySide
            title="Delete database"
            description="Delete this database and all of its associated data. This action cannot be undone."
            icon={<HiTrash />}
            noUpperBorder
            shaded
            right={
              <Button
                variant="light"
                radius="xl"
                color="red"
                leftIcon={<HiOutlineTrash />}
                fullWidth
                onClick={() =>
                  openConfirmModal({
                    title: "Delete database",
                    children: (
                      <Text size="sm" color="dimmed">
                        Are you sure you want to delete this database? This
                        action cannot be undone, and no data will be recoverable
                        after deletion.
                      </Text>
                    ),
                    labels: {
                      confirm: "Delete database",
                      cancel: "Cancel",
                    },
                    confirmProps: {
                      variant: "light",
                      color: "red",
                      radius: "xl",
                      leftIcon: <HiOutlineTrash />,
                    },
                    cancelProps: {
                      variant: "light",
                      color: "gray",
                      radius: "xl",
                    },
                    onConfirm: deleteDatabase,
                    closeOnConfirm: true,
                  })
                }
              >
                Permanently delete
              </Button>
            }
          />
        </Tabs.Panel>
      </Tabs>
    </>
  ) : (
    SSRLoader
  );
};

export default SelectedDatabaseView;
