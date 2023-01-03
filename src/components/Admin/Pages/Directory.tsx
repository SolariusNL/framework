import {
  Avatar,
  Badge,
  Button,
  Divider,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { openModal } from "@mantine/modals";
import { Employee, EmployeeRole } from "@prisma/client";
import { getCookie } from "cookies-next";
import { createElement, Fragment, useEffect, useState } from "react";
import { HiArrowRight, HiMail, HiSearch } from "react-icons/hi";
import employeeRoleMeta from "../../../data/employeeRoles";
import getMediaUrl from "../../../util/getMedia";
import { NonUser } from "../../../util/prisma-types";
import ModernEmptyState from "../../ModernEmptyState";
import ShadedButton from "../../ShadedButton";

const headers = {
  "Content-Type": "application/json",
  Authorization: String(getCookie(".frameworksession")),
};

const Directory: React.FC = () => {
  const [employees, setEmployees] = useState<
    Array<Employee & { user: NonUser }>
  >([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<EmployeeRole | null>(null);

  const getEmployees = async () => {
    const res = await fetch(
      "/api/admin/directory?" +
        new URLSearchParams({
          search,
          ...(role ? { role } : {}),
        }),
      {
        method: "GET",
        headers,
      }
    );

    const data = await res.json();
    setEmployees(data);
  };

  useEffect(() => {
    getEmployees();
  }, [search, role]);

  return (
    <>
      <Group mb="md">
        <TextInput
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          placeholder="Search"
          icon={<HiSearch />}
        />
        <Select
          value={role}
          onChange={(e) => setRole(e as EmployeeRole)}
          placeholder="Role"
          data={[
            ...Object.entries(EmployeeRole).map(([key, value]) => ({
              label: employeeRoleMeta.get(value),
              value: value as EmployeeRole,
            })),
            {
              label: "All",
              value: null as unknown as EmployeeRole,
            },
          ]}
        />
      </Group>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {employees &&
          employees.map((employee) => (
            <ShadedButton
              key={employee.user.id}
              className="flex justify-between"
              onClick={() => {
                openModal({
                  title: employee.user.username,
                  children: (
                    <>
                      {employee.bio && (
                        <Text mb={16}>
                          {employee.bio.split("\n").map((line, i) => (
                            <Fragment key={line}>
                              {line}
                              <br />
                            </Fragment>
                          ))}
                        </Text>
                      )}
                      <Stack spacing={4}>
                        {[
                          ["Username", employee.user.username],
                          ["Contact", employee.contactEmail],
                          ["Name", employee.fullName],
                          [
                            "File Created",
                            new Date(
                              employee.createdAt as Date
                            ).toLocaleDateString(),
                          ],
                          [
                            "Contract Expires",
                            new Date(
                              employee.contractExpiresAt as Date
                            ).toLocaleDateString(),
                          ],
                          ["Role", employeeRoleMeta.get(employee.role)],
                          [
                            "Probationary",
                            employee.probationary ? "Yes" : "No",
                          ],
                        ].map(([label, value]) => (
                          <div className="flex justify-between" key={label}>
                            <Text color="dimmed">{label}</Text>
                            <Text weight={500}>{value}</Text>
                          </div>
                        ))}
                      </Stack>
                      {employee.skills && employee.skills.length > 0 && (
                        <div className="flex items-center gap-1 mt-4">
                          {employee.skills.map((s) => (
                            <Badge key={s}>{s}</Badge>
                          ))}
                        </div>
                      )}

                      <Divider
                        mt={28}
                        mb={28}
                        label="Actions"
                        labelPosition="center"
                      />
                      <div className="flex justify-end gap-3">
                        <a href={`mailto:${employee.contactEmail}`}>
                          <Button leftIcon={<HiMail />} component="a">
                            Send email
                          </Button>
                        </a>
                      </div>
                    </>
                  ),
                  closeButtonLabel: "Close",
                });
              }}
            >
              <div className="flex items-center gap-4">
                <Avatar
                  src={getMediaUrl(employee.user.avatarUri)}
                  size={28}
                  radius={999}
                />
                <div>
                  <Text size="lg" weight={500}>
                    {employee.fullName}
                  </Text>
                  <Text size="sm" color="dimmed">
                    {employee.contactEmail}
                  </Text>
                  <Badge mt={8}>{employeeRoleMeta.get(employee.role)}</Badge>
                </div>
              </div>
              <HiArrowRight />
            </ShadedButton>
          ))}
        {employees.length === 0 && (
          <div className="col-span-3">
            <ModernEmptyState title="No users" body="No users found" />
          </div>
        )}
      </div>
    </>
  );
};

export default Directory;
