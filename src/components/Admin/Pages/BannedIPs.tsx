import {
  Button,
  Modal,
  Skeleton,
  Table,
  Textarea,
  TextInput
} from "@mantine/core";
import { BannedIP } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { HiStop, HiTrash, HiUpload } from "react-icons/hi";
import ModernEmptyState from "../../ModernEmptyState";
import Stateful from "../../Stateful";

const BannedIPs = () => {
  const [banned, setBanned] = useState<BannedIP[]>();

  useEffect(() => {
    fetch("/api/admin/bannedips", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setBanned(res);
      });
  }, []);

  const unban = (id: string) => {
    fetch(`/api/admin/bannedips/delete/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then(() => {
        setBanned(
          banned?.filter((ip) => {
            return ip.id !== id;
          })
        );
      });
  };

  const ban = (ip: string, reason: string) => {
    fetch(`/api/admin/bannedips/new/${ip}?reason=${reason}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setBanned([...banned!, res]);
      });
  };

  return (
    <>
      <Stateful>
        {(open, setOpen) => (
          <>
            <Button leftIcon={<HiStop />} mb={16} onClick={() => setOpen(true)}>
              Ban IP
            </Button>

            <Modal title="Ban IP" opened={open} onClose={() => setOpen(false)}>
              <Stateful>
                {(ip, setIP) => (
                  <Stateful>
                    {(reason, setReason) => (
                      <>
                        <TextInput
                          label="IP"
                          description="Enter a valid IP address."
                          value={ip}
                          onChange={(e) => setIP(e.currentTarget.value)}
                          mb={8}
                        />
                        <Textarea
                          label="Reason"
                          description="Explain why you're banning this IP."
                          value={reason}
                          onChange={(e) => setReason(e.currentTarget.value)}
                          mb={32}
                        />
                        <Button
                          fullWidth
                          color="red"
                          leftIcon={<HiUpload />}
                          disabled={
                            String(ip).match(
                              /^([0-9]{1,3}\.){3}[0-9]{1,3}$/
                            ) === null
                          }
                          onClick={() => {
                            ban(ip, reason);
                            setOpen(false);
                          }}
                        >
                          Ban
                        </Button>
                      </>
                    )}
                  </Stateful>
                )}
              </Stateful>
            </Modal>
          </>
        )}
      </Stateful>

      <Table striped>
        <thead>
          <tr>
            <th>IP</th>
            <th>Reason</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {!banned ? (
            <tr>
              <td colSpan={3}>
                <Skeleton height={32} width="100%" />
              </td>
            </tr>
          ) : banned.length === 0 ? (
            <tr>
              <td colSpan={3}>
                <ModernEmptyState title="No banned IPs" body="There are no banned IPs." />
              </td>
            </tr>
          ) : (
            banned.map((ip) => {
              return (
                <tr key={ip.id}>
                  <td>{ip.ip}</td>
                  <td>{ip.reason}</td>
                  <td>
                    <Button
                      color="red"
                      onClick={() => {
                        unban(ip.id);
                      }}
                      size="xs"
                      leftIcon={<HiTrash />}
                    >
                      Unban
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </>
  );
};

export default BannedIPs;
