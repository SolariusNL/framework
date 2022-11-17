const getMediaUrl = (path: string): string => {
  return `${
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_PERSISTENT_FILE_STORAGE_BASE ||
        "https://media.soodam.rocks"
      : ""
  }${path}`;
};

export default getMediaUrl;
