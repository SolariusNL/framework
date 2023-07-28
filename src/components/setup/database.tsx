import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import { next, prev } from "@/reducers/setup";
import IResponseBase from "@/types/api/IResponseBase";
import fetchJson from "@/util/fetch";
import {
  Button,
  NumberInput,
  Radio,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { openModal } from "@mantine/modals";
import { FC, useState } from "react";
import { HiArrowSmLeft, HiArrowSmRight, HiCheckCircle } from "react-icons/hi";
import { useDispatch } from "react-redux";
import InlineError from "../inline-error";

enum InputType {
  String = "string",
  Manual = "manual",
}
type StringForm = {
  connectionUrl: string;
};
type ManualForm = {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  driver: "mysql" | "postgresql";
};

const DatabaseStep: FC = () => {
  const [inputType, setInputType] = useState<InputType>();
  const [complete, setComplete] = useState<boolean>(false);
  const dispatch = useDispatch();
  const stringForm = useForm<StringForm>({
    initialValues: {
      connectionUrl: "",
    },
    validate: {
      connectionUrl: (value) => {
        const regex = /^(mysql|postgresql):\/\/.+/;

        if (!regex.test(value)) {
          return "Invalid connection string";
        }
      },
    },
  });
  const manualForm = useForm<ManualForm>({
    initialValues: {
      host: "",
      port: 0,
      username: "",
      password: "",
      database: "",
      driver: "mysql",
    },
    validate: {
      host: (value) => {
        if (!value) {
          return "Host is required";
        }
      },
      port: (value) => {
        if (!value) {
          return "Port is required";
        }
      },
      username: (value) => {
        if (!value) {
          return "Username is required";
        }
      },
      database: (value) => {
        if (!value) {
          return "Database is required";
        }
      },
    },
  });

  const testConnection = async (values: ManualForm | StringForm) => {
    setComplete(false);
    await fetchJson<IResponseBase>("/api/setup/db", {
      method: "POST",
      body: {
        type: inputType,
        ...values,
      },
    }).then((res) => {
      if (res.success) {
        setComplete(true);
      } else {
        openModal({
          title: "Connection failed",
          children: (
            <InlineError title="Database connection failure">
              {res.message ?? "Unknown error - possible server error"}
            </InlineError>
          ),
        });
      }
    });
  };

  return (
    <>
      <Title order={2} mb="sm">
        Database
      </Title>
      <Text size="sm" color="dimmed">
        A database is required to store your Framework instance data. You can
        use either MySQL or PostgreSQL. We recommend using PostgreSQL.
      </Text>
      <div className="my-2">
        <Radio.Group
          spacing="xs"
          onChange={(v: InputType) => {
            setInputType(v);
            setComplete(false);
          }}
        >
          <Radio
            classNames={{
              radio: BLACK.input,
            }}
            value={InputType.String}
            label="Use a connection string"
          />
          <Radio
            classNames={{
              radio: BLACK.input,
            }}
            value={InputType.Manual}
            label="Manually enter database details"
          />
        </Radio.Group>
        {inputType === InputType.String && (
          <form className="mt-4" onSubmit={stringForm.onSubmit(testConnection)}>
            <TextInput
              classNames={BLACK}
              label="Connection string"
              description="Enter your database connection string"
              required
              placeholder="mysql://user:password@host:port/database"
              {...stringForm.getInputProps("connectionUrl")}
            />
            <div className="flex justify-end mt-1">
              <Button size="xs" type="submit">
                Test connection
              </Button>
            </div>
            {complete && (
              <InlineError
                variant="success"
                title="Success"
                icon={<HiCheckCircle />}
              >
                Your connection string is valid!
              </InlineError>
            )}
          </form>
        )}
        {inputType === InputType.Manual && (
          <form className="mt-4" onSubmit={manualForm.onSubmit(testConnection)}>
            <Stack spacing="sm">
              <Select
                classNames={BLACK}
                label="Driver"
                placeholder="Select driver"
                required
                data={[
                  { value: "mysql", label: "MySQL" },
                  { value: "postgresql", label: "PostgreSQL" },
                ]}
                {...manualForm.getInputProps("driver")}
              />
              <TextInput
                classNames={BLACK}
                label="Host"
                required
                placeholder="localhost"
                {...manualForm.getInputProps("host")}
              />
              <NumberInput
                classNames={BLACK}
                label="Port"
                required
                placeholder="3306"
                {...manualForm.getInputProps("port")}
              />
              <TextInput
                classNames={BLACK}
                label="Username"
                required
                placeholder="root"
                {...manualForm.getInputProps("username")}
              />
              <TextInput
                classNames={BLACK}
                label="Password"
                required
                placeholder="password"
                {...manualForm.getInputProps("password")}
              />
              <TextInput
                classNames={BLACK}
                label="Database"
                required
                placeholder="framework"
                {...manualForm.getInputProps("database")}
              />
              <div className="flex justify-end mt-1">
                <Button size="xs" type="submit">
                  Test connection
                </Button>
              </div>
              {complete && (
                <InlineError
                  variant="success"
                  title="Success"
                  icon={<HiCheckCircle />}
                >
                  Your database connection is valid!
                </InlineError>
              )}
            </Stack>
          </form>
        )}
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

export default DatabaseStep;
