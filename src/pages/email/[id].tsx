import LoadingIndicator from "@/components/loading-indicator";
import authorizedRoute from "@/util/auth";
import prisma from "@/util/prisma";
import { Button, Code, Container, Divider, Text, Title } from "@mantine/core";
import { EmailReceipt } from "@prisma/client";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import Link from "next/link";
import { FC } from "react";
import { HiArrowSmLeft, HiOutlineMail, HiOutlineTag } from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";

type EmailReceiptProps = {
  receipt: EmailReceipt;
};
type DataRow = {
  key: string;
  value: string;
};

const EmailReceipt: FC<EmailReceiptProps> = ({ receipt }) => {
  const dataRows: DataRow[] = [
    {
      key: "Subject",
      value: receipt.subject,
    },
    {
      key: "Recipient",
      value: receipt.to,
    },
    {
      key: "Created at",
      value: new Date(receipt.createdAt).toLocaleString(),
    },
  ];

  return (
    <ReactNoSSR
      onSSR={
        <Container className="flex items-center justify-center">
          <LoadingIndicator />
        </Container>
      }
    >
      <main className="min-h-screen w-full h-full flex flex-col justify-center items-center">
        <div className="max-w-xl py-4 md:my-32 my-12 px-4 w-full h-full">
          <Link href="/" passHref>
            <Button
              variant="light"
              radius="xl"
              leftIcon={<HiArrowSmLeft />}
              component="a"
              className="mb-8"
            >
              Back to home
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <HiOutlineMail className="text-dimmed text-2xl" />
            <Title order={2} className="flex items-center gap-4">
              Email <Code>{receipt.id.split("-")[0]}</Code>
            </Title>
            <Divider className="flex-grow" />
          </div>
          <div className="flex flex-col gap-2 mt-8">
            {dataRows
              .filter((row) => row.value)
              .map((row, i) => (
                <div className="flex gap-2" key={i}>
                  <Text
                    color="dimmed"
                    style={{ width: "30%" }}
                    className="flex-shrink-0 flex items-center gap-2"
                  >
                    <HiOutlineTag />
                    {row.key}
                  </Text>
                  <Text
                    style={{
                      maxWidth: "70%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    weight={500}
                  >
                    {row.value}
                  </Text>
                </div>
              ))}
          </div>
          <div
            dangerouslySetInnerHTML={{
              __html: receipt.template,
            }}
            className="rounded-md overflow-auto mt-8"
          />
        </div>
      </main>
    </ReactNoSSR>
  );
};

export const getServerSideProps: GetServerSideProps<EmailReceiptProps> = async (
  ctx: GetServerSidePropsContext
) => {
  const { id } = ctx.params as { id: string };
  const auth = await authorizedRoute(ctx, true, false);

  if (!id)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  if (auth.redirect) return auth;

  const receipt = await prisma.emailReceipt.findFirst({
    where: {
      id,
      to: auth.props.user?.email,
    },
  });

  if (!receipt)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

  return {
    props: {
      receipt: JSON.parse(JSON.stringify(receipt)),
    },
  };
};

export default EmailReceipt;
