import prisma from "@/util/prisma";
import { Code, Divider, Text, Title } from "@mantine/core";
import { EmailReceipt } from "@prisma/client";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { FC } from "react";
import { HiOutlineTag } from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";

type EmailReceiptProps = {
  receipt: EmailReceipt;
};

const EmailReceipt: FC<EmailReceiptProps> = ({ receipt }) => {
  return (
    <>
      <main className="min-h-screen w-full h-full flex flex-col justify-center items-center">
        <div className="max-w-xl py-4 md:my-32 my-12 px-4 w-full h-full">
          <div className="flex items-center gap-4">
            <HiOutlineTag className="text-dimmed text-2xl" />
            <Title order={2} className="flex items-center gap-2">
              Email <Code>{receipt.id.split("-")[0]}</Code>
            </Title>
            <Divider className="flex-grow" />
          </div>
          <div className="flex flex-col gap-1 mt-8">
            {[
              {
                key: "Subject",
                value: receipt.subject,
              },
              {
                key: "Sent to",
                value: receipt.to,
              },
              {
                key: "Sent at",
                value: new Date(receipt.createdAt).toLocaleString(),
              },
            ]
              .filter((row) => row.value)
              .map((row, i) => (
                <div className="flex gap-2" key={i}>
                  <Text
                    weight={500}
                    color="dimmed"
                    style={{ width: "15%" }}
                    className="flex-shrink-0"
                  >
                    {row.key}
                  </Text>
                  <Text
                    style={{
                      maxWidth: "60%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {row.value}
                  </Text>
                </div>
              ))}
          </div>
          <ReactNoSSR>
            <div
              dangerouslySetInnerHTML={{
                __html: receipt.template,
              }}
              className="rounded-md overflow-auto mt-8"
            />
          </ReactNoSSR>
        </div>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<EmailReceiptProps> = async (
  ctx: GetServerSidePropsContext
) => {
  const { id } = ctx.params as { id: string };
  if (!id)
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };

  const receipt = await prisma.emailReceipt.findFirst({
    where: {
      id,
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
