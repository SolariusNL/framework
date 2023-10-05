const buildTenantUrl = (tenantPhrase: string) => {
  const base = process.env.NEXT_PUBLIC_TENANT_BASE;
  if (!base)
    throw new Error(
      "Tenant system is not configured. Please set NEXT_PUBLIC_TENANT_BASE in .env"
    );

  return `${base}/${tenantPhrase}`;
};
