import ConnectionsWidget from "@/components/widgets/connections";
import { Pagination, Select } from "@mantine/core";
import { Connection } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";

const Cosmic: React.FC = () => {
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState<"online" | "offline" | "all">("all");
  const [servers, setServers] = useState<Connection[]>([]);

  const fetchServers = async () => {
    await fetch(
      "/api/nucleus/servers?" +
        new URLSearchParams({
          page: page.toString(),
          status: status || "all",
        }).toString(),
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: String(getCookie(".frameworksession")),
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        setServers(res.servers);
        setPages(res.pages);
      });
  };

  useEffect(() => {
    fetchServers();
  }, [page, status]);

  return (
    <>
      <div className="flex items-center gap-6 flex-wrap md:flex-nowrap mb-8">
        <Pagination
          total={pages}
          page={page}
          onChange={setPage}
          radius="md"
          withEdges
        />
        <Select
          className="flex items-center gap-2"
          label="Status"
          placeholder="Sort by status"
          data={[
            { label: "Online", value: "online" },
            { label: "Offline", value: "offline" },
            { label: "All", value: "all" },
          ]}
          value={status}
          onChange={(v) => setStatus(String(v) as any)}
        />
      </div>

      <ConnectionsWidget controlledData={servers} />
    </>
  );
};

export default Cosmic;
