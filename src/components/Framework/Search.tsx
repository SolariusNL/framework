import { Autocomplete, Kbd } from "@mantine/core";
import { useRouter } from "next/router";
import React from "react";
import { HiSearchCircle } from "react-icons/hi";

const Search = ({ ref }: { ref: React.RefObject<HTMLInputElement> }) => {
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
          <Kbd>Ctrl</Kbd>
          <span style={{ margin: "0 5px" }}>+</span>
          <Kbd>K</Kbd>
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
    />
  );
};

export default Search;