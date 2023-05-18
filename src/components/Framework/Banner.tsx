import { Box, Container, Text, ThemeIcon } from "@mantine/core";
import { FC, useEffect, useState } from "react";
import { HiSpeakerphone } from "react-icons/hi";
import useFastFlags from "../../stores/useFastFlags";

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
      <Box p="sm" className="bg-red-500 text-white">
        <Container className="flex items-center">
          <ThemeIcon color="yellow" size={28} mr={16}>
            <HiSpeakerphone />
          </ThemeIcon>

          <Text weight={500}>{String(flags.banner.message)}</Text>
        </Container>
      </Box>
    </>
  );
};

export default Banner;
