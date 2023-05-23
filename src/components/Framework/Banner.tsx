import { Box, Container, Text, ThemeIcon } from "@mantine/core";
import { FC, useEffect, useState } from "react";
import { HiSpeakerphone } from "react-icons/hi";
import useFastFlags from "../../stores/useFastFlags";
import { Fw } from "../../util/fw";

const Banner: FC = () => {
  const { flags } = useFastFlags();
  const [banner, setBanner] = useState<{ enabled: boolean; message: string }>();

  useEffect(() => {
    if (flags.banner) {
      setBanner({
        enabled: flags.banner.enabled,
        message: flags.banner.message,
      });
    }
  }, [flags]);

  if (!banner?.enabled) return null;

  return (
    <>
      <Box p="sm" className="dark:bg-red-500/50 bg-red-400 text-white">
        <Container className="flex items-center">
          <ThemeIcon color="red" size={28} mr={16}>
            <HiSpeakerphone />
          </ThemeIcon>

          <Text>
            {Fw.StringParser.t(banner.message).bold().links().parse()}
          </Text>
        </Container>
      </Box>
    </>
  );
};

export default Banner;
