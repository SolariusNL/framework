import { Text, Title } from "@mantine/core";
import React from "react";
import { HiOutlineEmojiSad, HiOutlineSparkles } from "react-icons/hi";
import { Preferences } from "../../util/preferences";
import LoadingIndicator from "../LoadingIndicator";

const GiftFlow: React.FC = () => {
  const [initial, setInitial] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    Preferences.getPreferences().then((preferences) => {
      const i = preferences?.data?.preferences["@app/secret-gift"]!;
      setInitial(Boolean(i));

      if (!i) {
        Preferences.setPreferences({
          "@app/secret-gift": true,
        });
      }
    });
  }, []);

  return (
    <>
      <div className="flex text-center items-center flex-col gap-4">
        {initial === undefined ? (
          <div className="w-full flex items-center justify-center py-4">
            <LoadingIndicator />
          </div>
        ) : initial ? (
          <>
            <HiOutlineEmojiSad className="text-red-200 text-6xl" />
            <Title order={3}>Already claimed!</Title>
            <Text size="sm" color="dimmed">
              You already claimed your secret gift. Sorry!
            </Text>
          </>
        ) : (
          <>
            <HiOutlineSparkles className="text-sky-400 text-6xl" />
            <Title order={3}>You found a secret!</Title>
            <Text size="sm" color="dimmed">
              Your gift is 750 Tickets. Enjoy!
            </Text>
          </>
        )}
      </div>
    </>
  );
};

export default GiftFlow;
