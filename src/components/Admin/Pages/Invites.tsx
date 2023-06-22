import {
  ActionIcon,
  Avatar,
  Button,
  Group,
  Modal,
  Pagination,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Invite } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { HiCheck, HiPlus, HiTrash, HiX } from "react-icons/hi";
import getMediaUrl from "../../../util/get-media";
import { NonUser } from "../../../util/prisma-types";

const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const Invites = () => {
  const [keys, setKeys] = useState<
    | Array<
        Invite & {
          createdBy: NonUser;
        }
      >
    | undefined
  >(undefined);
  const [createOpened, setCreateOpened] = useState(false);
  const [page, setPage] = useState(1);
  const form = useForm<{
    email: string;
  }>({
    initialValues: {
      email: "",
    },
  });

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

  const handleCreate = async (values: { email: string }) => {
    await fetch("/api/admin/invites/new/1", {
      method: "POST",
      headers: {
        Authorization: String(getCookie(".frameworksession")),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: values.email,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setCreateOpened(false);
        form.reset();
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
        opened={createOpened}
        onClose={() => setCreateOpened(false)}
        title="Create invite"
      >
        <form onSubmit={form.onSubmit(handleCreate)}>
          <Stack spacing={8}>
            <TextInput
              label="Recipient email"
              description="The email of the recipient - leave blank to not send an email"
              placeholder="test@solarius.me"
              {...form.getInputProps("email")}
            />
            <div className="flex justify-end mt-4">
              <Button type="submit">Create</Button>
            </div>
          </Stack>
        </form>
      </Modal>

      <Group mb={24}>
        <Button leftIcon={<HiPlus />} onClick={() => setCreateOpened(true)}>
          Create key
        </Button>
      </Group>

      <Pagination
        mb={24}
        total={keys ? Math.ceil(keys.length / 10) : 0}
        page={page}
        onChange={setPage}
        withEdges
        radius="md"
      />

      <ScrollArea>
        <Table>
          <thead>
            <tr>
              <th>Created</th>
              <th>Code</th>
              <th>Created By</th>
              <th>To</th>
              <th>Used?</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {keys?.slice((page - 1) * 10, page * 10).map((key) => (
              <tr key={key.id} className="whitespace-nowrap">
                <td>{new Date(key.createdAt).toLocaleString()}</td>
                <td className="font-semibold">{key.code}</td>
                <td>
                  {key.createdBy ? (
                    <div className="flex items-center gap-2">
                      <Avatar
                        src={getMediaUrl(key.createdBy.avatarUri)}
                        radius={999}
                        size={24}
                      />
                      <Text color="dimmed">{key.createdBy.username}</Text>
                    </div>
                  ) : (
                    <Text color="dimmed">Data unavailable</Text>
                  )}
                </td>
                <td>
                  {key.sentToEmail ? (
                    <Text color="dimmed">{key.sentToEmail}</Text>
                  ) : (
                    <Text color="dimmed">Not sent</Text>
                  )}
                </td>
                <td>
                  <div className="flex items-center">
                    {key.used ? (
                      <HiCheck className="text-green-500" />
                    ) : (
                      <HiX className="text-red-500" />
                    )}
                  </div>
                </td>
                <td>
                  <ActionIcon color="red" onClick={() => deleteKey(key.id)}>
                    <HiTrash />
                  </ActionIcon>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
    </>
  );
};

export default Invites;
