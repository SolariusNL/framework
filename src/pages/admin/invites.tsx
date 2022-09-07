import {
  Button,
  Group,
  Modal,
  NumberInput,
  Pagination,
  Table,
  Title,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { Invite } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import { HiPlus } from "react-icons/hi";
import Framework from "../../components/Framework";
import authorizedRoute from "../../util/authorizedRoute";
import { User } from "../../util/prisma-types";

interface InvitesProps {
  user: User;
}

const Invites: NextPage<InvitesProps> = ({ user }) => {
  const [keys, setKeys] = useState<Invite[] | undefined>(undefined);

  const [createBulkOpened, setCreateBulkOpened] = useState(false);
  const [bulkAmount, setBulkAmount] = useState(1);

  const [createIndividualOpened, setCreateIndividualOpened] = useState(false);

  const getKeys = async () => {
    await fetch("/api/admin/invites", {
      headers: {
        Authorization: String(getCookie(".frameworksession")),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setKeys(res);
      });
  };

  useEffect(() => {
    getKeys();
  }, []);

  const handleBulkCreate = async () => {
    await fetch(`/api/admin/invites/new/${bulkAmount}`, {
      method: "POST",
      headers: {
        Authorization: String(getCookie(".frameworksession")),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setCreateBulkOpened(false);
        getKeys();
      });
  };

  return (
    <>
      <Modal
        opened={createBulkOpened}
        onClose={() => setCreateBulkOpened(false)}
        title="Create Bulk Invites"
      >
        <NumberInput
          label="Amount"
          description="Choose a number between 1 and 500"
          mb={24}
          value={bulkAmount}
          onChange={(value) => setBulkAmount(Number(value))}
          min={1}
          max={500}
        />
        <Button fullWidth onClick={() => handleBulkCreate()}>
          Create bulk invites
        </Button>
      </Modal>

      <Modal
        opened={createIndividualOpened}
        onClose={() => setCreateIndividualOpened(false)}
        title="Create Individual Invite"
      >
        <Button
          fullWidth
          onClick={() => {
            setBulkAmount(1);
            handleBulkCreate();
          }}
        >
          Create individual invite
        </Button>
      </Modal>

      <Framework user={user} activeTab="none">
        <Title mb={24}>Invite Keys</Title>

        <Group mb={24}>
          <Button.Group>
            <Button
              leftIcon={<HiPlus />}
              onClick={() => setCreateBulkOpened(true)}
            >
              Create single key
            </Button>
            <Button
              leftIcon={<HiPlus />}
              onClick={() => setCreateBulkOpened(true)}
            >
              Create bulk keys
            </Button>
          </Button.Group>
        </Group>

        <Table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Used?</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {keys?.map((key) => (
              <tr key={key.id}>
                <td>{key.code}</td>
                <td>{key.used ? "Yes" : "No"}</td>
                <td>
                  <Button size="xs" color="red">
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Framework>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false, true);
}

export default Invites;
