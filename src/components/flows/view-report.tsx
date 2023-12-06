import { getReportStateColor, getReportStateLabel } from "@/data/report-state";
import {
  GetReportByIdResponse,
  ViewableReport,
} from "@/pages/api/abuse/[[...params]]";
import clsx from "@/util/clsx";
import fetchJson from "@/util/fetch";
import { Badge, Divider, Text, Title } from "@mantine/core";
import React, { useEffect, useState } from "react";
import LoadingIndicator from "../loading-indicator";
import Owner from "../owner";

const ViewReportFlow: React.FC = () => {
  const [report, setReport] = useState<ViewableReport>();
  const [success, setSuccess] = useState<boolean>(false);

  const fetchReport = async () => {
    const params = new URLSearchParams(window.location.search);
    const reportId = params.get("reportId");

    await fetchJson<GetReportByIdResponse>(`/api/abuse/${reportId}`, {
      auth: true,
      method: "GET",
    }).then((res) => {
      setSuccess(res.success);
      if (res.data?.report) {
        setReport(res.data.report);
      }
    });
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <>
      <>
        {success ? (
          <>
            <div className="flex items-center gap-4 mb-4">
              <Title order={3}>
                Report{" "}
                <span className="text-dimmed">{report?.id.slice(0, 8)}</span>
              </Title>
              <Divider className="flex-grow" />
            </div>
            <div className="flex flex-col gap-1 mb-4">
              {[
                {
                  key: "Reported user",
                  value: <Owner user={report?.user!} />,
                },
                {
                  key: "Filed on",
                  value: new Date(report?.createdAt!).toLocaleString(),
                  className: "mt-2",
                },
                {
                  key: "Category",
                  value: report?.reason,
                },
                {
                  key: "Status",
                  value: (
                    <Badge
                      className="!px-1.5"
                      color={getReportStateColor(report?.state!)}
                      radius="sm"
                    >
                      {getReportStateLabel(report?.state!)}
                    </Badge>
                  ),
                },
              ]
                .filter((row) => row.value)
                .map((row, i) => (
                  <div className={clsx("flex gap-2", row.className)} key={i}>
                    <Text
                      weight={500}
                      color="dimmed"
                      style={{ width: "35%" }}
                      className="flex-shrink-0"
                    >
                      {row.key}
                    </Text>
                    <Text
                      style={{
                        maxWidth: "60%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.value}
                    </Text>
                  </div>
                ))}
            </div>
            <div className="flex items-center gap-4 mb-2">
              <Title order={4} className="text-dimmed">
                You said:
              </Title>
              <Divider className="flex-grow" />
            </div>
            <Text>{report?.description}</Text>
          </>
        ) : (
          <div className="flex justify-center">
            <LoadingIndicator />
          </div>
        )}
      </>
    </>
  );
};

export default ViewReportFlow;
