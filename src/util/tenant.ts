type BuildTenantUrlOpts = {
  protocol?: "http" | "https";
  port?: number;
  path?: string;
};

const buildTenantUrl = (tenantPhrase: string, opts: BuildTenantUrlOpts) => {
  const base = process.env.NEXT_PUBLIC_TENANT_BASE;
  const { protocol, port, path } = opts || {};
  if (!base)
    throw new Error(
      "Tenant system is not configured. Please set NEXT_PUBLIC_TENANT_BASE in .env"
    );

  return `${protocol || "https"}://${tenantPhrase}.${base}${
    port ? `:${port}` : ""
  }${path || ""}`;
};

export default buildTenantUrl;
