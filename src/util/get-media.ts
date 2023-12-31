const getMediaUrl = (path: string): string => {
  return `${
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_PERSISTENT_FILE_STORAGE_BASE ||
        "/api/media/local-file"
      : "/api/media/local-file"
  }${path}`;
};

export default getMediaUrl;
