import { Autocomplete, Kbd } from "@mantine/core";
import { useRouter } from "next/router";
import React, { useRef } from "react";
import { HiSearchCircle } from "react-icons/hi";

const Search = ({ mobile }: { mobile?: boolean }) => {
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
      rightSectionWidth={30}
      rightSection={<Kbd>/</Kbd>}
      value={search}
      autoFocus
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
