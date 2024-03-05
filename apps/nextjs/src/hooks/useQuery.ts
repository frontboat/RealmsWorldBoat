import { usePathname, useRouter, useSearchParams } from "next/navigation";

type QueryParam = Record<string, string>;

// Custom hook to handle query parameters
export const useQuery = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Get query parameters from the URL
  function getQueriesFromUrl(): QueryParam[] {
    const queryParams: QueryParam[] = [];

    for (const [key, value] of searchParams.entries()) {
      queryParams.push({ key, value });
    }

    return queryParams;
  }

  // Handle attribute click event
  const handleAttributeClick = (
    key: string,
    value: string,
    multi?: boolean,
  ) => {
    const params = new URLSearchParams(searchParams);

    if (multi) {
      if (params.getAll(key).includes(value) || params.get(key) === value) {
        params.delete(key, value);
      } else {
        params.append(key, value);
      }
    } else {
      params.get(key) === value ? params.delete(key) : params.set(key, value);
    }

    // Update the URL with the modified query parameters
    router.replace(`${pathname}?${params}`);
  };

  // Check if attribute is present in the query parameters
  const isAttributeInQuery = (key: string, value: string): boolean => {
    return (
      searchParams.has(key) &&
      (searchParams.get(key) === value ||
        searchParams.getAll(key).includes(value))
    );
  };

  // Check if key is present in the query parameters
  const isKeyInQuery = (key: string): boolean => {
    return searchParams.has(key);
  };

  return {
    getQueriesFromUrl,
    handleAttributeClick,
    isAttributeInQuery,
    isKeyInQuery,
  };
};
