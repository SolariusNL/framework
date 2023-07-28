import Framework from "@/components/framework";
import { Section } from "@/components/home/friends";
import ShadedCard from "@/components/shaded-card";
import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import {
  IRedlockVerifyLicenseResponse,
  StudioKeyType,
} from "@/types/api/IRedlockVerifyLicenseResponse";
import authorizedRoute from "@/util/auth";
import { REDLOCK } from "@/util/constants";
import fetchJson from "@/util/fetch";
import { User } from "@/util/prisma-types";
import {
  Button,
  FileInput,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import {
  HiArrowRight,
  HiCheckCircle,
  HiMail,
  HiUpload,
  HiUser,
  HiXCircle,
} from "react-icons/hi";

type ActivateStudioProps = {
  user: User;
};

type ActivationForm = {
  pk: string;
  email: string;
  name: string;
};
type Stage = "form" | "success";

const ActivateStudio: React.FC<ActivateStudioProps> = ({ user }) => {
  const form = useForm<ActivationForm>({
    initialValues: {
      pk: "",
      email: "",
      name: "",
    },
    validate: {
      pk: (value) => {
        if (!value) {
          return "Activation key is required";
        }
      },
      email: (value) => {
        if (!value) {
          return "Email is required";
        }
      },
      name: (value) => {
        if (!value) {
          return "Name is required";
        }
      },
    },
  });
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>("form");
  const [validatedType, setValidatedType] = useState<StudioKeyType>(
    StudioKeyType.Unknown
  );

  useEffect(() => {
    if (licenseFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const lines = (e.target?.result as string).split("\n");
        const [name, email, pk] = lines.map((line) => atob(line));
        form.setFieldValue("name", name);
        form.setFieldValue("email", email);
        form.setFieldValue("pk", pk);
      };
      reader.readAsText(licenseFile);
    }
  }, [licenseFile]);

  return (
    <Framework
      activeTab="none"
      modernTitle="Activate Studio License"
      user={user}
      modernSubtitle="Fill out the required information to activate your Studio license."
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Text color="dimmed" mb={6}>
            Activate Studio license
          </Text>
          <Title order={2} mb={24}>
            Information
          </Title>
          <Text size="sm" color="dimmed" mb="md">
            Framework Studio is our new IDE for building experiences on
            Framework. It is powered by Godot Engine and Visual Studio Code,
            allowing access to a wide range of tools and extensions to help you
            build your dream game.
          </Text>
          <Text size="sm" color="dimmed" mb="md">
            Studio is currently in alpha and requires an activation key to use.
            If you were invited to try out Studio, you will have received all
            necessary information to activate your license.
          </Text>
          <Text size="sm" color="dimmed" mb="md">
            Here&apos;s what you need:
          </Text>
          <ul className="list-disc">
            <li>
              <Text size="sm" color="dimmed">
                Full name - used to protect your license key from being used by
                others
              </Text>
            </li>
            <li>
              <Text size="sm" color="dimmed">
                Email - used to identify your Framework account and also to
                protect your license key from being used by others
              </Text>
            </li>
            <li>
              <Text size="sm" color="dimmed">
                Product key - used to activate your license
              </Text>
            </li>
          </ul>
          <Text size="sm" color="dimmed" mb="md" mt="lg">
            We hope that you enjoy using Studio. If you have any questions or
            feedback, please feel free to reach out to us on Discord, or through
            our Feedback prompt in Studio.
          </Text>
        </div>
        <div className="flex-1">
          <ShadedCard className="relative">
            {stage === "form" ? (
              <form
                onSubmit={form.onSubmit(async (v) => {
                  fetchJson<IRedlockVerifyLicenseResponse>(
                    REDLOCK + "/api/v1/validate",
                    {
                      body: {
                        name: v.name,
                        email: v.email,
                        productKey: v.pk,
                      },
                      responseType: "json",
                      throwOnFail: false,
                      method: "POST",
                    }
                  )
                    .then((res) => {
                      if (res.message || res.errors) {
                        showNotification({
                          title: "Error",
                          message: `Failed to validate Studio license: ${
                            res.errors?.join(", ") ||
                            res.message ||
                            "Unknown error"
                          }`,
                          icon: <HiXCircle />,
                          color: "red",
                        });
                      } else {
                        setValidatedType(res.keyType);
                        setStage("success");
                      }
                    })
                    .catch((e) => {
                      showNotification({
                        title: "Error",
                        message: `Failed to validate Studio license: ${e.message}`,
                        icon: <HiXCircle />,
                        color: "red",
                      });
                    });
                })}
              >
                <Section
                  title="License details"
                  description="Please enter the information you received in the email."
                  sm
                />
                <TextInput
                  icon={<HiUser />}
                  placeholder="Full name"
                  label="Full name"
                  required
                  description="Please enter the full name in the email you received."
                  classNames={BLACK}
                  mb="sm"
                  {...form.getInputProps("name")}
                />
                <TextInput
                  type="email"
                  placeholder="Email"
                  label="Email"
                  required
                  description="Please enter the email in your invitation."
                  classNames={BLACK}
                  icon={<HiMail />}
                  mb="sm"
                  {...form.getInputProps("email")}
                />
                <Textarea
                  placeholder="Activation key"
                  label="Activation key"
                  required
                  description="Please enter the activation key in your invitation. This is a long string of letters and numbers."
                  classNames={BLACK}
                  mb="sm"
                  {...form.getInputProps("pk")}
                />
                <div className="flex justify-end gap-2 items-center flex-col md:flex-row">
                  <Text size="sm" color="dimmed">
                    You can also upload a license file:
                  </Text>
                  <FileInput
                    variant="default"
                    icon={<HiUpload />}
                    placeholder="Import license file"
                    classNames={BLACK}
                    accept=".lic"
                    value={licenseFile}
                    onChange={setLicenseFile}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    mt="lg"
                    size="lg"
                    leftIcon={<HiArrowRight />}
                    type="submit"
                  >
                    Activate license
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex justify-center text-center items-center flex-col">
                <div className="flex items-center gap-3">
                  <HiCheckCircle className="text-pink-500/50 flex-shrink-0 w-8 h-8" />
                  <Title order={3}>{validatedType} license activated</Title>
                </div>
                <Text size="sm" color="dimmed" mt="md">
                  Your Studio license has been activated. You can now use Studio
                  to build your game.
                </Text>
                <Button
                  mt="xl"
                  leftIcon={<HiArrowRight />}
                  variant="light"
                  color="pink"
                >
                  Return to Studio
                </Button>
                <Text size="sm" color="dimmed" weight={500} mt="lg" mb={8}>
                  if you don&apos;t have Studio installed
                </Text>
                <Button leftIcon={<HiArrowRight />} variant="subtle">
                  Download Studio
                </Button>
              </div>
            )}
          </ShadedCard>
          <Text size="sm" color="dimmed" mt="lg" align="center">
            Protected by Solarius RedLock licensing system.
          </Text>
        </div>
      </div>
    </Framework>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return authorizedRoute(ctx, false, false);
};

export default ActivateStudio;
