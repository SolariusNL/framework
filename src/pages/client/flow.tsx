import Framework from "@/components/framework";
import authorizedRoute from "@/util/auth";
import { User } from "@/util/prisma-types";
import { Button, Checkbox, Skeleton, Text } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import { HiCheckCircle } from "react-icons/hi";

interface FlowProps {
  user: User;
}

enum Stage {
  License,
  Confirmation,
  Finished,
}

const Flow: NextPage<FlowProps> = ({ user }) => {
  const [stage, setStage] = useState<Stage>(Stage.License);
  const [licenseText, setLicenseText] = useState("");
  const [licenseChecked, setLicenseChecked] = useState(false);

  useEffect(() => {
    fetch("/api/doc/license")
      .then((res) => res.text())
      .then((text) => setLicenseText(text));
  }, []);

  return (
    <Framework
      activeTab="none"
      user={user}
      modernTitle="License and Agreements"
      modernSubtitle="Please read and accept the following agreements to finish installing Framework."
    >
      {stage === Stage.License && (
        <>
          <div
            style={{
              marginBottom: 12,
            }}
          >
            {!licenseText ? (
              <Skeleton height={120} />
            ) : (
              <Text>{licenseText}</Text>
            )}
          </div>

          <Checkbox
            checked={licenseChecked}
            onChange={(e) => setLicenseChecked(e.currentTarget.checked)}
            label="I have read and agree to the license agreement."
            mb={6}
          />
          <Button
            disabled={!licenseChecked}
            onClick={() => setStage(Stage.Confirmation)}
          >
            Continue
          </Button>
        </>
      )}

      {stage === Stage.Confirmation && (
        <>
          <Text>By clicking the button below, you agree to the following:</Text>

          <ul>
            <li>You have read and agree to the license agreement.</li>
            <li>
              You have read and agreed to our Terms of Service and Privacy
              Policy.
            </li>
            <li>
              You are using Framework in good faith and will not use it to
              abuse, harass, or otherwise harm other users.
            </li>
          </ul>

          <Text mb={6}>
            Framework is a very open platform, and we trust you to use it in a
            way that is fair and just. If you do not agree to these terms,
            please do not use Framework.
          </Text>

          <Button onClick={() => setStage(Stage.Finished)}>Continue</Button>
        </>
      )}

      {stage === Stage.Finished && (
        <>
          <Text>
            <HiCheckCircle />
            &nbsp;Thanks for understanding and agreeing to our terms. You will
            be returned to the client momentarily.
          </Text>
        </>
      )}
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context);
}

export default Flow;
