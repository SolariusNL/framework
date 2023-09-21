import Descriptive from "@/components/descriptive";
import InlineError from "@/components/inline-error";
import Owner from "@/components/owner";
import PinInput from "@/components/pin-input";
import OuterUI from "@/layouts/OuterUI";
import logout from "@/util/api/logout";
import prisma from "@/util/prisma";
import { NonUser, nonCurrentUserSelect } from "@/util/prisma-types";
import { Anchor, Button, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { openConfirmModal } from "@mantine/modals";
import { EmailLoginRequest } from "@prisma/client";
import { setCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiOutlineCheck } from "react-icons/hi";

type EmailLoginProps = {
  emailId: string;
  request: Omit<
    EmailLoginRequest & {
      user: NonUser;
    },
    "code"
  >;
};
type Form = {
  code?: number;
};

const EmailLogin: NextPage<EmailLoginProps> = ({ emailId, request }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<Form>({
    initialValues: {
      code: undefined,
    },
    validate: {
      code: (value: number) => {
        if (value.toString().length !== 6) return "Code must be 6 digits";
        if (!value) return "You must enter a code";
      },
    },
  });

  const submitForm = async (values: Form) => {
    setLoading(true);

    await fetch(`/api/auth/email/${emailId}/${values.code}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success === true) {
          setCookie(".frameworksession", res.token, {
            maxAge: 60 * 60 * 24 * 7,
          });
          router.push("/");
        } else {
          setError(res.message || "An unknown error occurred");
        }
      })
      .catch(() => {
        setError("An unknown error occurred");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <OuterUI
      title="Verify your email"
      description="Please check your email for a 6-digit verification code. Allow up to 10 minutes to receive an email and check your spam folder."
    >
      <div className="w-full flex items-center justify-center flex-col">
        <div className="flex items-start gap-4 mb-4">
          <Text size="sm" color="dimmed">
            Logging in as
          </Text>
          <div className="flex flex-col gap-2">
            <Owner user={request.user} />
            <Anchor
              size="sm"
              onClick={() =>
                openConfirmModal({
                  title: "Confirmation",
                  children: (
                    <Text size="sm" color="dimmed">
                      Are you sure you want to logout of your account?
                    </Text>
                  ),
                  labels: {
                    confirm: "Logout",
                    cancel: "Nevermind",
                  },
                  confirmProps: {
                    variant: "light",
                    color: "red",
                    radius: "xl",
                  },
                  cancelProps: {
                    variant: "light",
                    radius: "xl",
                    color: "gray",
                  },
                  async onConfirm() {
                    await logout().then(() => router.push("/login"));
                  },
                })
              }
            >
              Not you? Sign out
            </Anchor>
          </div>
        </div>
        <form onSubmit={form.onSubmit(submitForm)}>
          <Descriptive title="Code" required>
            <PinInput length={6} {...form.getInputProps("code")} />
          </Descriptive>
          {error && (
            <InlineError
              className="mt-4"
              title="An error occurred"
              variant="error"
            >
              {error}
            </InlineError>
          )}
          <div className="flex justify-end mt-4">
            <Button
              variant="light"
              loading={loading}
              radius="xl"
              leftIcon={<HiOutlineCheck />}
              type="submit"
            >
              Verify login
            </Button>
          </div>
        </form>
      </div>
    </OuterUI>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query;
  const request = await prisma.emailLoginRequest.findFirst({
    where: {
      id: String(id),
    },
    select: {
      id: true,
      user: nonCurrentUserSelect,
      createdAt: true,
    },
  });

  if (
    !request ||
    new Date(JSON.parse(JSON.stringify(request)).createdAt).getTime() +
      1000 * 60 * 60 <
      Date.now()
  ) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      emailId: String(id),
      request: JSON.parse(JSON.stringify(request)),
    },
  };
}

export default EmailLogin;
