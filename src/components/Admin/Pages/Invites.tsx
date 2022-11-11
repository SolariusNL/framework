import {
  Button,
  Group,
  Modal,
  NumberInput,
  Pagination,
  Table,
} from "@mantine/core";
import { Invite } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { HiPlus } from "react-icons/hi";

const Invites = () => {
  const [keys, setKeys] = useState<Invite[] | undefined>(undefined);
  const [createBulkOpened, setCreateBulkOpened] = useState(false);
  const [bulkAmount, setBulkAmount] = useState(1);
  const [createIndividualOpened, setCreateIndividualOpened] = useState(false);
  const [page, setPage] = useState(1);

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
      .then(() => {
        setCreateBulkOpened(false);
        getKeys();
      });
  };

  const deleteKey = async (id: string) => {
    await fetch(`/api/admin/invites/delete/${id}`, {
      method: "POST",
      headers: {
        Authorization: String(getCookie(".frameworksession")),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then(() => {
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
            setCreateIndividualOpened(false);
          }}
        >
          Create individual invite
        </Button>
      </Modal>

      <Group mb={24}>
        <Button.Group>
          <Button
            leftIcon={<HiPlus />}
            onClick={() => setCreateIndividualOpened(true)}
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

      <Pagination
        mb={24}
        total={keys ? Math.ceil(keys.length / 10) : 0}
        page={page}
        onChange={setPage}
        withEdges
      />

      <Table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Used?</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {keys?.slice((page - 1) * 10, page * 10).map((key) => (
            <tr key={key.id}>
              <td>{key.code}</td>
              <td>{key.used ? "Yes" : "No"}</td>
              <td>
                <Button size="xs" color="red" onClick={() => deleteKey(key.id)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default Invites;
