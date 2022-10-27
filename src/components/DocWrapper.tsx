import { Text } from "@mantine/core";
import React from "react";
import { HiClock } from "react-icons/hi";
import { User } from "../util/prisma-types";
import Framework from "./Framework";

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
    <Framework
      user={children?.props?.user}
      activeTab="none"
      modernTitle={meta.title}
      modernSubtitle={meta.summary}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 32,
        }}
      >
        <HiClock />
        <Text size="sm">Last updated: {meta.lastModified}</Text>
      </div>
      {children}
    </Framework>
  );
};

export default DocWrapper;
