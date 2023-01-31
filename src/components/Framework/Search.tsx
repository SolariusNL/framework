import { Autocomplete, Kbd } from "@mantine/core";
import { useRouter } from "next/router";
import React, { useRef } from "react";
import { HiSearchCircle } from "react-icons/hi";

const Search = ({
  opened,
  setOpened,
  mobile,
}: {
  opened?: boolean;
  setOpened?: (opened: boolean) => void;
  mobile?: boolean;
}) => {
  const [search, setSearch] = React.useState("");
  const router = useRouter();
  const searchOptions = [
    search.trim().length > 0
      ? ["games", "users", "catalog", "sounds"].map((provider) => {
          return {
            value: `Search ${provider} for "${search}"`,
            provider: provider,
            query: search,
          };
        })
      : [],
  ].flat();
  const ref = useRef<HTMLInputElement>(null);

  return (
    <Autocomplete
      icon={<HiSearchCircle />}
      placeholder="Search Framework"
      variant="default"
      type="search"
      styles={{ rightSection: { pointerEvents: "none" } }}
      rightSectionWidth={90}
      rightSection={
        <div style={{ display: "flex", alignItems: "center" }}>
          <Kbd>Mod</Kbd>
          <span style={{ margin: "0 5px" }}>+</span>
          <Kbd>E</Kbd>
        </div>
      }
      value={search}
      onChange={setSearch}
      data={searchOptions}
      onItemSubmit={(item) => {
        const { provider, query } = item;

        setSearch("");
        router.push(`/search?query=${query}&category=${provider}`);
      }}
      ref={ref}
      {...(mobile && {
        size: "md",
      })}
    />
  );
};

export default Search;
