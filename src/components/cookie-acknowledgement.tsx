import { Anchor, Button, Dialog, Group, Text } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import Link from "next/link";
import { FC } from "react";

const KEY = "soodam-cookie-consent";
const DEFAULT_VALUE = { accepted: false, rejected: false };

type CookieConsent = {
  accepted: boolean;
  rejected: boolean;
};

const CookieAcknowledgementDialog: FC = () => {
  const [cookieConsent, setCookieConsent] = useLocalStorage<CookieConsent>({
    key: KEY,
    defaultValue: DEFAULT_VALUE,
  });

  return (
    <Dialog
      opened={!cookieConsent.accepted && !cookieConsent.rejected}
      data-cy="landing-cookie-dialog"
    >
      <Text size="sm" mb={12}>
        Framework and other Solarius services use cookies to help us provide you
        the best experience. By continuing to use our services, you agree to our
        use of cookies. Read our{" "}
        <Link href="/privacy" passHref>
          <Anchor>Privacy Policy</Anchor>
        </Link>{" "}
        for more information regarding your privacy and how we use cookies.
      </Text>

      <Group grow>
        <Button
          onClick={() =>
            setCookieConsent({
              accepted: true,
              rejected: false,
            })
          }
          data-cy="landing-accept-cookie"
        >
          I agree
        </Button>

        <Button
          onClick={() =>
            setCookieConsent({
              accepted: false,
              rejected: true,
            })
          }
        >
          I do not agree
        </Button>
      </Group>
    </Dialog>
  );
};

export default CookieAcknowledgementDialog;
