import { Alert, Skeleton, Title } from "@mantine/core";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import { HiExclamationCircle } from "react-icons/hi";
import Framework from "../../components/Framework";
import authorizedRoute from "../../util/authorizedRoute";
import { User } from "../../util/prisma-types";

interface InstanceProps {
  user: User;
}

const Instance: NextPage<InstanceProps> = ({ user }) => {
  const [version, setVersion] = useState("");
  const [latestVersion, setLatestVersion] = useState("");

  useEffect(() => {
    fetch("/api/admin/instance", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setVersion(res.version);
      });

    fetch("https://tsodinq.github.io/framework/docs/version.txt")
      .then((res) => res.text())
      .then((res) => {
        setLatestVersion(res.substring(0, res.length - 1));
      });
  }, []);

  return (
    <>
      <Framework
        user={user}
        activeTab="none"
        modernTitle="Instance"
        modernSubtitle="Manage your Framework instance, see system information, and more."
      >
        <Title mb={24} order={2}>
          Framework{" "}
          {!version ? (
            <span
              style={{
                display: "inline-flex",
              }}
            >
              <Skeleton height={32} width={74} />
            </span>
          ) : (
            version
          )}
        </Title>

        {version !== latestVersion && (
          <Alert
            mb={24}
            color="red"
            icon={<HiExclamationCircle size="24" />}
            title="Update available"
          >
            You are running Framework {version}, but the latest version is{" "}
            {latestVersion}. Please update your instance to get the latest
            features and bug fixes.
          </Alert>
        )}
      </Framework>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false, true);
}

export default Instance;
