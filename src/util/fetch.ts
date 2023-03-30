import { getCookie } from "cookies-next";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type FetchJsonOptions<T> = {
  method?: HttpMethod;
  body?: Record<string, unknown>;
  auth?: boolean;
  headers?: Record<string, string>;
  throwOnFail?: boolean;
  responseType?: "json" | "text" | "blob" | "arrayBuffer";
  transformResponse?: (data: any) => T;
};

async function fetchJson<T>(
  url: string,
  options: FetchJsonOptions<T> = {}
): Promise<T> {
  const {
    method = "GET",
    body,
    auth = false,
    headers = {},
    throwOnFail = true,
    responseType = "json",
    transformResponse = (data) => data as T,
  } = options;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
      ...(auth
        ? { Authorization: String(getCookie(".frameworksession")) }
        : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let responseData: any;
  switch (responseType) {
    case "json":
      responseData = await response.json();
      break;
    case "text":
      responseData = await response.text();
      break;
    case "blob":
      responseData = await response.blob();
      break;
    case "arrayBuffer":
      responseData = await response.arrayBuffer();
      break;
    default:
      throw new Error(`Unsupported response type: ${responseType}`);
  }

  if (!response.ok) {
    if (throwOnFail) {
      throw new Error(`Request failed with status ${response.status}`);
    } else {
      return responseData;
    }
  }

  const transformedData: T = transformResponse(responseData);

  return transformedData;
}

export default fetchJson;
