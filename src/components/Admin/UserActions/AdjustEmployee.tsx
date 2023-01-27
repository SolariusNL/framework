import {
  Button,
  Checkbox,
  Modal,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { EmployeeRole, Role } from "@prisma/client";
import dayjs from "dayjs";
import React, { useEffect } from "react";
import { HiUser } from "react-icons/hi";
import performAdminAction, { AdminAction } from "../../../util/adminAction";
import { User } from "../../../util/prisma-types";
import Stateful from "../../Stateful";
import Action from "./Action";

interface AdjustEmployeeProps {
  user: User;
}

interface FormValues {
  role: EmployeeRole;
  fullName: string;
  contractExpiresAt: Date;
  contactEmail: string;
  probationary: boolean;
}

const AdjustEmployee: React.FC<AdjustEmployeeProps> & {
  title: string;
  description: string;
  condition: (user: User) => boolean;
} = ({ user }) => {
  const form = useForm<FormValues>({
    initialValues: {
      role: user.employee?.role || EmployeeRole.CONTENT_MODERATOR,
      fullName: user.employee?.fullName || "",
      contractExpiresAt:
        new Date(user.employee?.contractExpiresAt as Date) ||
        new Date(new Date().setMonth(new Date().getMonth() + 3)),
      contactEmail: user.employee?.contactEmail || "",
      probationary: user.employee?.probationary || false,
    },
    validate: {
      role: (value: EmployeeRole) => {
        if (!value) {
          return "Role is required";
        }
      },
      fullName: (value) => {
        if (!value) {
          return "Full name is required";
        }
      },
      contractExpiresAt: (value) => {
        if (!value) {
          return "Contract expiration date is required";
        }
      },
      contactEmail: (value) => {
        if (
          !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
            value
          )
        ) {
          return "Invalid email address";
        }
      },
    },
  });

  useEffect(() => {
    form.setFieldValue(
      "role",
      user.employee?.role || EmployeeRole.CONTENT_MODERATOR
    );
    form.setFieldValue("fullName", user.employee?.fullName || "");
    form.setFieldValue(
      "contractExpiresAt",
      dayjs(user.employee?.contractExpiresAt as Date).toDate() ||
        dayjs(new Date().setMonth(new Date().getMonth() + 3)).toDate()
    );
    form.setFieldValue("contactEmail", user.employee?.contactEmail || "");
    form.setFieldValue("probationary", user.employee?.probationary || false);
  }, [user]);

  return (
    <Stateful>
      {(open, setOpen) => (
        <>
          <Action
            title="Adjust employee"
            description="Adjust employee information"
            onClick={() => setOpen(true)}
            icon={HiUser}
            condition={user.role !== Role.ADMIN}
          />
          <Modal
            title="Modify employee information"
            onClose={() => setOpen(false)}
            opened={open}
          >
            <form
              onSubmit={form.onSubmit(async (values) => {
                await performAdminAction(
                  AdminAction.EDIT_EMPLOYEE,
                  values,
                  user.id
                ).then(() => setOpen(false));
              })}
            >
              <Stack spacing={16}>
                <Select
                  label="Role"
                  description="The role of this employee"
                  data={Object.keys(EmployeeRole).map((key) => ({
                    label: key,
                    value: EmployeeRole[key as keyof typeof EmployeeRole],
                  }))}
                  required
                  {...form.getInputProps("role")}
                />
                <TextInput
                  label="Full name"
                  description="The full name of this employee"
                  required
                  {...form.getInputProps("fullName")}
                />
                <DatePicker
                  label="Contract expiration date"
                  description="The date this employee's contract expires"
                  required
                  {...form.getInputProps("contractExpiresAt")}
                />
                <TextInput
                  type="email"
                  label="Contact email"
                  description="The email address of this employee"
                  required
                  {...form.getInputProps("contactEmail")}
                />
                <Checkbox
                  label="Employee is in probationary period"
                  checked={form.values.probationary}
                  onChange={(event) =>
                    form.setFieldValue(
                      "probationary",
                      event.currentTarget.checked
                    )
                  }
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="default"
                    onClick={() => {
                      setOpen(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </Stack>
            </form>
          </Modal>
        </>
      )}
    </Stateful>
  );
};

AdjustEmployee.title = "Adjust employee";
AdjustEmployee.description = "Adjust employee information";
AdjustEmployee.condition = (user) =>
  user.employee !== null && user.role === Role.ADMIN;

export default AdjustEmployee;
