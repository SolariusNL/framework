import { Badge, Divider, ScrollArea, Text, Title } from "@mantine/core";
import { NewLogin, Session } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  HiLink,
  HiOutlineDesktopComputer,
  HiOutlineDeviceMobile,
  HiQuestionMarkCircle,
} from "react-icons/hi";
import IResponseBase from "../../types/api/IResponseBase";
import fetchJson from "../../util/fetch";
import {
  Device,
  getOperatingSystemDevice,
  getOperatingSystemEnumFromString,
  getOperatingSystemString,
} from "../../util/ua";
import LoadingIndicator from "../LoadingIndicator";

export type Login = NewLogin & {
  session: Session;
};

const LoginFlow: React.FC = () => {
  const [logins, setLogins] = useState<Login[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogins = async () => {
    await fetchJson<IResponseBase<{ logins: Login[] }>>("/api/auth/logins", {
      auth: true,
    })
      .then((res) => {
        if (res.success) {
          setLogins(res.data?.logins!);
        }
      })
      .finally(() => setLoading(false));
  };

  const getOS = (os: string) =>
    getOperatingSystemDevice(getOperatingSystemEnumFromString(os));

  useEffect(() => {
    fetchLogins();
  }, []);

  return (
    <>
      {loading ? (
        <div className="w-full flex items-center justify-center py-4">
          <LoadingIndicator />
        </div>
      ) : (
        <ScrollArea
          sx={{
            maxHeight: 500,
          }}
        >
          {logins.map((login, i) => (
            <>
              {i !== 0 && <Divider mt="xl" mb="xl" />}
              <div className="flex flex-col" key={login.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Badge
                      sx={{
                        width: 32,
                        height: 32,
                        padding: 0,
                      }}
                      className="flex items-center justify-center"
                      radius="xl"
                    >
                      {getOS(login.device) === Device.Desktop ? (
                        <HiOutlineDesktopComputer
                          size={16}
                          className="flex items-center justify-center"
                        />
                      ) : getOS(login.device) === Device.Mobile ? (
                        <HiOutlineDeviceMobile
                          size={16}
                          className="flex items-center justify-center"
                        />
                      ) : login.device !== null ? (
                        <HiLink
                          size={16}
                          className="flex items-center justify-center"
                        />
                      ) : (
                        <HiQuestionMarkCircle
                          size={16}
                          className="flex items-center justify-center"
                        />
                      )}
                    </Badge>
                    <div className="flex flex-col gap-1">
                      <Title order={5}>
                        {getOperatingSystemString(
                          getOperatingSystemEnumFromString(login.device)
                        )}
                      </Title>
                      <Text size="sm" color="dimmed" weight={500}>
                        {login.ip}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ))}
        </ScrollArea>
      )}
    </>
  );
};

export default LoginFlow;
