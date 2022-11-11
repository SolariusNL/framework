import { Grid, Pagination } from "@mantine/core";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { Report } from "../../../util/prisma-types";
import useMediaQuery from "../../../util/useMediaQuery";
import ModernEmptyState from "../../ModernEmptyState";
import ReportCard from "../../ReportCard";

const Reports = () => {
  const [reports, setReports] = useState<Report[]>();
  const mobile = useMediaQuery("768");
  const [page, setPage] = useState(1);

  const getReports = async () => {
    await fetch("/api/admin/reports", {
      headers: {
        Authorization: String(getCookie(".frameworksession")),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setReports(res);
      });
  };

  useEffect(() => {
    getReports();
  }, []);

  return (
    <>
      <Pagination
        total={reports ? Math.ceil(reports.length / 10) : 0}
        page={page}
        onChange={setPage}
        mb={12}
      />
      <Grid columns={6}>
        {reports && reports.length > 0 ? (
          reports.map((report) => (
            <Grid.Col key={report.id} span={mobile ? 6 : 2}>
              <ReportCard report={report} />
            </Grid.Col>
          ))
        ) : (
          <Grid.Col span={6}>
            <ModernEmptyState
              title="No reports"
              body="No reports have been made yet."
            />
          </Grid.Col>
        )}
      </Grid>
    </>
  );
};

export default Reports;
