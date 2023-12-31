import MinimalFooter from "@/components/minimal-footer";
import { Confirmation, confirmations } from "@/data/confirmations";
import { Anchor, Text, Title } from "@mantine/core";
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from "next";
import Link from "next/link";
import { FC } from "react";
import { HiArrowRight } from "react-icons/hi";

type ConfirmedProps = {
  confirmation: Confirmation;
};

const Confirmed: FC<ConfirmedProps> = ({ confirmation }) => {
  return (
    <>
      <main className="w-full h-full flex flex-col justify-center items-center">
        <div className="max-w-xl py-4 md:my-32 my-12 px-4 w-full h-full">
          <div
            className="absolute md:block hidden inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden sm:top-[-20rem]"
            style={{
              filter: "blur(64px)",
            }}
          >
            <svg
              className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
              viewBox="0 0 1155 678"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
                fillOpacity=".3"
                d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
              />
              <defs>
                <linearGradient
                  id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
                  x1="1155.49"
                  x2="-78.208"
                  y1=".177"
                  y2="474.645"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#9089FC"></stop>
                  <stop offset="1" stopColor="#FF80B5"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex md:flex-row md:text-start text-center flex-col">
            <Title order={2}>{confirmation.title}</Title>
          </div>
          <Text mt="xl" color="dimmed" className="md:text-start text-center">
            {confirmation.body}
          </Text>
          <div className="absolute flex justify-center flex-col items-center gap-4 bottom-12 left-0 right-0">
            <Link href="/">
              <Anchor size="sm" className="flex items-center gap-2">
                <HiArrowRight />
                Return to Framework
              </Anchor>
            </Link>
            <div>
              <MinimalFooter />
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: confirmations.map((c) => ({
      params: {
        id: c.identifier,
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<ConfirmedProps> = async (
  ctx: GetStaticPropsContext
) => {
  const params = ctx.params as { id: string };
  const confirmation = confirmations.find((c) => c.identifier === params?.id)!;

  return {
    props: {
      confirmation,
    },
  };
};

export default Confirmed;
