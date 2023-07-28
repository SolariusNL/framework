import SettingsTab from "@/components/settings/settings-tab";
import useExperimentsStore, { EXPERIMENTS } from "@/stores/useExperimentsStore";
import { User } from "@/util/prisma-types";
import { Anchor, Badge, Button, ScrollArea, Table, Text } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiGift } from "react-icons/hi";

interface BetaTabProps {
  user: User;
}

const BetaTab = ({ user }: BetaTabProps) => {
  const [enrolled, setEnrolled] = useState(user.enrolledInPreview);
  const [loading, setLoading] = useState(false);
  const { experiments, addExperiment, removeExperiment } =
    useExperimentsStore();
  const router = useRouter();

  const enroll = async () => {
    setLoading(true);

    await fetch("/api/users/@me/preview/enroll", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    }).then(() => {
      setEnrolled(true);
      setLoading(false);
    });
  };

  return (
    <SettingsTab tabValue="beta" tabTitle="Preview Program">
      <Text mb={16}>
        The preview program is a way for you to test out new features before
        they are released to the general public. This program is completely
        optional, and is available to all users.
      </Text>

      {!enrolled ? (
        <Button leftIcon={<HiGift />} onClick={enroll} loading={loading}>
          Enroll
        </Button>
      ) : (
        <>
          <Text weight={600} color="dimmed" mb={12}>
            Available experiments:
          </Text>

          <ScrollArea>
            <Table striped>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {EXPERIMENTS.map((experiment) => (
                  <tr key={experiment.name}>
                    <td className="font-semibold">{experiment.name}</td>
                    <td>
                      <Text color="dimmed">{experiment.description}</Text>
                    </td>
                    <td>
                      <Badge>{experiment.stage}</Badge>
                    </td>
                    <td>
                      <Anchor
                        onClick={() => {
                          if (experiments.includes(experiment.id)) {
                            removeExperiment(experiment.id);
                          } else {
                            addExperiment(experiment.id);
                          }
                          if (experiment.refreshNecessary)
                            openConfirmModal({
                              title: "Refresh required",
                              children: (
                                <Text size="sm" color="dimmed">
                                  In order to apply changes, you must refresh
                                  the page. Would you like to do that now?
                                </Text>
                              ),
                              labels: { confirm: "Refresh", cancel: "Later" },
                              onConfirm: () => {
                                router.reload();
                              },
                            });
                          if (experiment.additionalSetup)
                            experiment.additionalSetup(
                              experiments.includes(experiment.id)
                            );
                        }}
                      >
                        {experiments.includes(experiment.id)
                          ? "Disable"
                          : "Enable"}
                      </Anchor>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </ScrollArea>
        </>
      )}
    </SettingsTab>
  );
};

export default BetaTab;
