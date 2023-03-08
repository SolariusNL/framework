import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Menu,
  Pagination,
  ScrollArea,
  Select,
  Table,
  Text
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { AdminPermission, GiftCode, GiftCodeGrant } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import {
  HiCheckCircle,
  HiCreditCard,
  HiFilter,
  HiStar,
  HiTicket,
  HiTrash,
  HiXCircle
} from "react-icons/hi";
import giftGrants from "../../../data/giftGrants";
import useAuthorizedUserStore from "../../../stores/useAuthorizedUser";
import getMediaUrl from "../../../util/get-media";
import { NonUser } from "../../../util/prisma-types";
import ModernEmptyState from "../../ModernEmptyState";

type Filter = "unused" | "used" | "all" | "premium" | "tickets";
type Sort = "oldest" | "newest";
type GiftCodeWithRedeemer = GiftCode & {
  redeemedBy: NonUser;
  createdBy: NonUser;
};

const Gifts: React.FC = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [pages, setPages] = useState(1);
  const [activePage, setActivePage] = useState(1);
  const [codes, setCodes] = useState<GiftCodeWithRedeemer[]>();
  const { user } = useAuthorizedUserStore()!;

  const headers = {
    "Content-Type": "application/json",
    Authorization: String(getCookie(".frameworksession")),
  };

  const fetchCodes = async () => {
    const res = await fetch(
      `/api/admin/gifts?filter=${filter}&sort=${sort}&page=${activePage}`,
      {
        method: "GET",
        headers,
      }
    );

    const data = await res.json();
    setCodes(data.codes);
    setPages(data.pages);
  };

  const createCode = async (grant: GiftCodeGrant) => {
    const res = await fetch(`/api/admin/gifts/${grant}`, {
      method: "POST",
      headers,
    });

    const data = await res.json();
    if (data.success) {
      showNotification({
        title: "Gift code created",
        message: "Gift code created successfully",
        icon: <HiCheckCircle />,
      });
    } else {
      showNotification({
        title: "Error creating gift code",
        message:
          data.message ||
          "An unknown error occurred while creating the gift code",
        icon: <HiXCircle />,
      });
    }

    fetchCodes();
    setActivePage(1);
  };

  useEffect(() => {
    fetchCodes();
  }, [filter, sort, activePage]);

  return (
    <>
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-3 items-start">
          <Pagination
            total={pages}
            page={activePage}
            onChange={setActivePage}
            radius="md"
            className="md:mr-4"
          />
          <Select
            icon={<HiFilter />}
            value={filter}
            onChange={(v) => setFilter(v as Filter)}
            placeholder="Filter by"
            data={[
              { label: "All", value: "all" },
              { label: "Unused", value: "unused" },
              { label: "Used", value: "used" },
              { label: "Premium", value: "premium" },
              { label: "Tickets", value: "tickets" },
            ]}
          />
          <Select
            value={sort}
            onChange={(v) => setSort(v as Sort)}
            placeholder="Sort by"
            data={[
              { label: "Newest", value: "newest" },
              { label: "Oldest", value: "oldest" },
            ]}
          />
        </div>
        <Menu>
          <Menu.Target>
            {user?.adminPermissions?.includes(
              AdminPermission.GENERATE_GIFTS
            ) ? (
              <Button variant="subtle" leftIcon={<HiCreditCard />}>
                Create gift code
              </Button>
            ) : (
              <Text size="sm" color="dimmed">
                No permission.
              </Text>
            )}
          </Menu.Target>
          <Menu.Dropdown>
            {Object.keys(GiftCodeGrant).map((grant) => (
              <Menu.Item
                key={grant}
                icon={
                  giftGrants.get(grant as GiftCodeGrant)?.type === "premium" ? (
                    <HiStar />
                  ) : (
                    <HiTicket />
                  )
                }
                onClick={() => createCode(grant as GiftCodeGrant)}
              >
                {giftGrants.get(grant as GiftCodeGrant)?.description}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </div>
      <ScrollArea>
        <Table mt="lg" striped>
          <thead>
            <tr>
              <th>Code</th>
              <th>Value</th>
              <th>Redeemed by</th>
              <th>Created by</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="whitespace-nowrap">
            {codes && codes.length > 0 ? (
              codes.map((code) => (
                <tr key={code.id}>
                  <td className="font-semibold">{code.code}</td>
                  <td>
                    <Badge>{giftGrants.get(code.grant)?.description}</Badge>
                  </td>
                  <td>
                    {code.redeemedBy ? (
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={getMediaUrl(code.redeemedBy.avatarUri)}
                          radius={999}
                          size={24}
                        />
                        <Text color="dimmed">{code.redeemedBy.username}</Text>
                      </div>
                    ) : (
                      <Text color="dimmed">Not redeemed</Text>
                    )}
                  </td>
                  <td>
                    {code.createdBy ? (
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={getMediaUrl(code.createdBy.avatarUri)}
                          radius={999}
                          size={24}
                        />
                        <Text color="dimmed">{code.createdBy.username}</Text>
                      </div>
                    ) : (
                      <Text color="dimmed">No data available</Text>
                    )}
                  </td>
                  <td>
                    {new Date(code.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td>
                    <ActionIcon
                      disabled={
                        !user?.adminPermissions.includes(
                          AdminPermission.GENERATE_GIFTS
                        )
                      }
                      color="red"
                      onClick={async () => {
                        await fetch(`/api/admin/gifts/${code.id}`, {
                          method: "DELETE",
                          headers,
                        })
                          .then((res) => res.json())
                          .then(async (res) => {
                            if (res.success) {
                              showNotification({
                                title: "Deleted key",
                                message: "Successfully deleted gift code.",
                                icon: <HiCheckCircle />,
                              });

                              await fetchCodes();
                            } else {
                              showNotification({
                                title: "Error",
                                message: "Failed to delete gift code.",
                                icon: <HiXCircle />,
                              });
                            }
                          });
                      }}
                    >
                      <HiTrash />
                    </ActionIcon>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <ModernEmptyState
                    title="No gift codes"
                    body="No gift codes could be found with the current filter and sort."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </ScrollArea>
    </>
  );
};

export default Gifts;
