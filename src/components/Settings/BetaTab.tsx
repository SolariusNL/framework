import { Button, Table, Text } from "@mantine/core";
import { getCookie } from "cookies-next";
import { useState } from "react";
import { HiGift } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import EmptyState from "../EmptyState";
import SettingsTab from "./SettingsTab";

interface BetaTabProps {
  user: User;
}

const BetaTab = ({ user }: BetaTabProps) => {
  const [enrolled, setEnrolled] = useState(user.enrolledInPreview);
  const [loading, setLoading] = useState(false);

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

          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <EmptyState
                title="No experiments available"
                body="Check back later!"
              />
            </tbody>
          </Table>
        </>
      )}
    </SettingsTab>
  );
};

export default BetaTab;
