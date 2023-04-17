type GenerateCertificateOptions = {
  email: string;
  domain: string;
};

const generateCertificate = async ({
  domain,
  email,
}: GenerateCertificateOptions): Promise<void> => {
  // @todo VERIFY DOMAINS
  return new Promise((resolve) => resolve());
};

export default generateCertificate;
