import { Pagination, Select } from "@mantine/core";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { Report } from "../../../util/prisma-types";
import ModernEmptyState from "../../ModernEmptyState";
import ReportCard from "../../ReportCard";

const Reports = () => {
  const [reports, setReports] = useState<Report[]>();
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sort, setSort] = useState<"reviewed" | "unreviewed" | "all">("all");

  const getReports = async () => {
    await fetch(
      "/api/admin/reports?" +
        new URLSearchParams({
          page: page.toString(),
          sort: sort || "all",
        }),
      {
        headers: {
          Authorization: String(getCookie(".frameworksession")),
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        setReports(res.reports);
        setPages(res.pages);
      });
  };

  useEffect(() => {
    getReports();
  }, []);

  useEffect(() => {
    getReports();
  }, [page, sort]);

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
          label="Sort by"
          placeholder="Sort by"
          data={[
            { label: "Reviewed", value: "reviewed" },
            { label: "Unreviewed", value: "unreviewed" },
            { label: "All", value: "all" },
          ]}
          value={sort}
          onChange={(v) => setSort(v as any)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reports && reports.length > 0 ? (
          reports.map((report) => (
            <ReportCard report={report} key={report.id} />
          ))
        ) : (
          <div className="col-span-3">
            <ModernEmptyState
              title="No reports"
              body="No reports have been made yet."
            />
          </div>
        )}
      </div>
    </>
  );
};

export default Reports;
