import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import { next, prev } from "@/reducers/setup";
import IResponseBase from "@/types/api/IResponseBase";
import fetchJson from "@/util/fetch";
import { Button, Code, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { openModal } from "@mantine/modals";
import { FC, useState } from "react";
import { HiArrowSmLeft, HiArrowSmRight, HiCheckCircle } from "react-icons/hi";
import { useDispatch } from "react-redux";
import InlineError from "../inline-error";

type AdminForm = {
  username: string;
  password: string;
  email: string;
};

const AdminAccountStep: FC = () => {
  const [complete, setComplete] = useState<boolean>(false);
  const dispatch = useDispatch();
  const form = useForm<AdminForm>({
    initialValues: {
      username: "",
      password: "",
      email: "",
    },
    validate: {
      username: (value) => {
        if (!value) {
          return "Username is required";
        }
      },
      password: (value) => {
        if (!value) {
          return "Password is required";
        }
      },
      email: (value) => {
        if (!value) {
          return "Email is required";
        }
      },
    },
  });

  const createAccount = async (values: AdminForm) => {
    setComplete(false);
    await fetchJson<IResponseBase>("/api/setup/admin", {
      method: "POST",
      body: values,
    }).then((res) => {
      if (res.success) {
        setComplete(true);
      } else {
        openModal({
          title: "Failed to create admin account",
          children: (
            <InlineError title="Error" variant="error">
              An unknown error occurred while creating your admin account.
              Please contact Solarius support.
            </InlineError>
          ),
        });
      }
    });
  };

  return (
    <>
      <Title order={2} mb="sm">
        Admin account
      </Title>
      <Text size="sm" color="dimmed">
        Please enter the details for your admin account which will be considered
        your <Code>root</Code> account, with total access to your Framework
        instance.
      </Text>
      <div className="my-2">
        <form className="mt-4" onSubmit={form.onSubmit(createAccount)}>
          <Stack spacing="sm">
            <TextInput
              classNames={BLACK}
              label="Username"
              required
              placeholder="admin"
              {...form.getInputProps("username")}
            />
            <TextInput
              classNames={BLACK}
              label="Password"
              required
              type="password"
              placeholder="********"
              {...form.getInputProps("password")}
            />
            <TextInput
              classNames={BLACK}
              label="Email"
              required
              placeholder="admin@solarius.me"
              type="email"
              {...form.getInputProps("email")}
            />
            <div className="flex justify-end mt-1">
              <Button size="xs" type="submit">
                Create account
              </Button>
            </div>
            {complete && (
              <InlineError
                variant="success"
                title="Success"
                icon={<HiCheckCircle />}
              >
                Your admin account has been created successfully.
              </InlineError>
            )}
          </Stack>
        </form>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          mt="xl"
          leftIcon={<HiArrowSmLeft />}
          onClick={() => dispatch(prev())}
        >
          Back
        </Button>
        <Button
          mt="xl"
          leftIcon={<HiArrowSmRight />}
          onClick={() => dispatch(next())}
          disabled={!complete}
        >
          Next
        </Button>
      </div>
    </>
  );
};

export default AdminAccountStep;
