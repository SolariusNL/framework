import { blockedRegions } from "@/data/blocked-regions";
import { Text, Title } from "@mantine/core";
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from "next";
import { FC } from "react";

type RestrictedRegionProps = {
  notice: string;
};

const RestrictedRegion: FC<RestrictedRegionProps> = ({ notice }) => {
  return (
    <>
      <main className="w-full h-full flex flex-col justify-center items-center">
        <div className="max-w-xl py-4 md:my-32 my-12 px-4 w-full h-full">
          <Title>Region blocked</Title>
          <Text mt="xl" color="dimmed">
            {notice}
          </Text>
        </div>
      </main>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: Object.keys(blockedRegions).map((region) => ({
      params: {
        id: region,
      },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<RestrictedRegionProps> = async (
  ctx: GetStaticPropsContext
) => {
  const params = ctx.params as { id: string };
  const region = params.id;
  const notice = blockedRegions[region as keyof typeof blockedRegions];

  return {
    props: {
      notice: notice,
    },
  };
};

export default RestrictedRegion;
