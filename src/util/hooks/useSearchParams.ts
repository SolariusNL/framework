import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface SearchParams {
  [key: string]: string | number | boolean | undefined;
}

interface UseSearchParamsHook {
  (initialParams?: SearchParams): {
    searchParams: SearchParams;
    setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  };
}

const useSearchParams: UseSearchParamsHook = (initialParams = {}) => {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<SearchParams>(initialParams);

  useEffect(() => {
    const queryString = Object.keys(searchParams)
      .map((key) => {
        const value = searchParams[key];
        return value !== undefined ? `${key}=${encodeURIComponent(value)}` : "";
      })
      .filter((param) => param !== "")
      .join("&");

    const url = `${window.location.pathname}?${queryString}`;
    router.replace(url, undefined, { shallow: true });
  }, [searchParams, router]);

  return { searchParams, setSearchParams };
};

export default useSearchParams;
