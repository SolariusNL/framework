import Framework from "@/components/Framework";
import { proseStyles } from "@/components/RenderMarkdown";
import clsx from "@/util/clsx";
import { User } from "@/util/prisma-types";
import { NextSeo } from "next-seo";
import React from "react";

interface DocWrapperProps {
  children: {
    props: {
      user?: User;
    };
  } & React.ReactNode;
  meta: {
    title: string;
    lastModified: string;
    summary: string;
  };
}

const DocWrapper = ({ children, meta }: DocWrapperProps) => {
  return (
    <>
      <NextSeo
        title={meta.title}
        description={meta.summary}
        openGraph={{
          title: meta.title,
          description: meta.summary,
          images: [
            {
              secureUrl: "/opengraph.png",
              url: "/opengraph.png",
              alt: "Framework SEO Banner",
              width: 800,
              height: 400,
            },
          ],
        }}
      />
      <Framework user={children?.props?.user} activeTab="none" noPadding>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-[37.5rem] pt-20 text-center pb-24">
            <div className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              {meta.title}
            </div>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-zinc-400">
              Last updated on{" "}
              {new Date(meta.lastModified).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="relative sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[40rem]">
              <div className={clsx(proseStyles, "prose-sm")}>{children}</div>
            </div>
          </div>
        </div>
      </Framework>
    </>
  );
};

export default DocWrapper;
