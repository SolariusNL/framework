import {
  Anchor,
  Button,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { openConfirmModal } from "@mantine/modals";
import { HiArrowRight, HiKey, HiMail, HiUser } from "react-icons/hi";
import { BLACK } from "../../../pages/teams/t/[slug]/issue/create";
import { REDLOCK } from "../../../util/constants";
import fetchJson from "../../../util/fetch";
import Copy from "../../Copy";
import { Section } from "../../Home/FriendsWidget";
import ShadedCard from "../../ShadedCard";

type StudioLicenseForm = {
  fullName: string;
  email: string;
  keyType: number;
};

const Licenses: React.FC = () => {
  const form = useForm<StudioLicenseForm>({
    initialValues: {
      fullName: "",
      email: "",
      keyType: 0,
    },
    validate: {
      fullName(value) {
        if (!value) return "Provide a name";
      },
      email(value) {
        if (!value) return "Provide an email";
      },
      keyType(value) {
        if (!value) return "Provide a license type";
      },
    },
  });

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <Text color="dimmed" mb={6}>
          Studio License Keys
        </Text>
        <Title order={2} mb={24}>
          Information
        </Title>
        <Text size="sm" color="dimmed" mb="md">
          Framework Studio is our new IDE for building Framework games. It will
          soon be available in an early experimental development phase to select
          users.
        </Text>
        <Text size="sm" color="dimmed" mb="md">
          Studio is protected by our{" "}
          <Anchor
            href="https://invent.solarius.me/Soodam.re/internal/redlock-pk"
            target="_blank"
            rel="noreferrer"
          >
            RedLock
          </Anchor>{" "}
          licensing system.
        </Text>
      </div>
      <div className="flex-1">
        <ShadedCard>
          <Section
            title="License information"
            description="Please fill out the license information."
            sm
          />
          <form
            onSubmit={form.onSubmit(async (v) => {
              await fetchJson(REDLOCK + "/api/v1/create", {
                method: "POST",
                body: {
                  name: v.fullName,
                  email: v.email,
                  keyType: Number(v.keyType),
                },
                responseType: "text",
              }).then((res) => {
                openConfirmModal({
                  title: "License",
                  children: (
                    <>
                      <Text size="sm" color="dimmed">
                        License key generated. Please download the license file,
                        or copy the product key.
                      </Text>
                      <div className="flex items-center gap-4 justify-center p-4 mt-4">
                        <Copy value={String(res)} />
                        <Text size="sm" color="dimmed" weight={500}>
                          Copy product key
                        </Text>
                      </div>
                    </>
                  ),
                  labels: {
                    confirm: "Download",
                    cancel: "Don't download file",
                  },
                  onConfirm() {
                    fetchJson<Blob>(REDLOCK + "/api/v1/license", {
                      method: "POST",
                      responseType: "blob",
                      body: {
                        name: v.fullName,
                        email: v.email,
                        productKey: String(res),
                      },
                    }).then((blob) => {
                      const link = document.createElement("a");
                      link.href = URL.createObjectURL(blob);
                      link.download = `${v.fullName}.lic`;
                      link.click();
                    });
                  },
                });
              });
            })}
          >
            <Stack spacing={12}>
              <TextInput
                classNames={BLACK}
                label="Full name"
                description="Full name of the user receiving the license"
                icon={<HiUser />}
                placeholder="Enter a name"
                required
                {...form.getInputProps("fullName")}
              />
              <TextInput
                type="email"
                classNames={BLACK}
                label="Email"
                description="Enter the email of the user receiving the license - note that this will not send an email"
                icon={<HiMail />}
                placeholder="Enter an email"
                required
                {...form.getInputProps("email")}
              />
              <Select
                data={[
                  ...[
                    ["Unknown", 1001],
                    ["Trial", 1002],
                    ["Standard", 1003],
                    ["Professional", 1004],
                    ["Ultimate", 1005],
                    ["Enterprise", 1006],
                    ["Free", 1007],
                  ].map((v) => ({
                    label: String(v[0]),
                    value: String(v[1]),
                  })),
                ]}
                label="SKU Type"
                description="Enter the product key SKU type"
                placeholder="Select type"
                required
                icon={<HiKey />}
                classNames={BLACK}
                {...form.getInputProps("keyType")}
              />
              <div className="flex justify-end mt-2">
                <Button leftIcon={<HiArrowRight />} type="submit">
                  Create license
                </Button>
              </div>
            </Stack>
          </form>
        </ShadedCard>
      </div>
    </div>
  );
};

export default Licenses;
