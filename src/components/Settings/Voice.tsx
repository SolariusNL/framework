import { Alert, Anchor, Button, Progress, Select, Stack } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { HiBeaker, HiMicrophone, HiXCircle } from "react-icons/hi";
import useMicIdStore from "../../stores/useMicIdStore";
import { User } from "../../util/prisma-types";
import SettingsTab from "./SettingsTab";
import SideBySide from "./SideBySide";

interface VoiceTabProps {
  user: User;
}

const VoiceTab: React.FC<VoiceTabProps> = ({ user }) => {
  const [options, setOptions] = useState<
    Array<{
      value: string;
      label: string;
    }>
  >();
  const { micId, setMicId } = useMicIdStore();
  const [hasPermission, setHasPermission] = useState(false);
  const [testingInput, setTestingInput] = useState(false);
  const [testStream, setTestStream] = useState<MediaStream>();
  const [testVolume, setTestVolume] = useState(0);
  let audio: HTMLAudioElement;

  const getInputDevices = () => {
    if (navigator.mediaDevices === undefined) {
      return;
    }
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const audioInputs = devices.filter(
        (device) => device.kind === "audioinput"
      );
      const newOptions = audioInputs
        .filter((device) => device.deviceId)
        .map((device) => ({
          value: device.deviceId,
          label: device.label,
        }));

      if (newOptions.length > 0) {
        setHasPermission(true);
      }
      setOptions(newOptions);
    });
  };

  const testInput = () => {
    if (navigator.mediaDevices === undefined) {
      return;
    }
    setTestingInput((prev) => !prev);
    if (!testingInput) {
      navigator.mediaDevices
        .getUserMedia({
          audio: {
            deviceId: micId,
          },
        })
        .then((stream) => {
          setTestStream(stream);
          const audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          const microphone = audioContext.createMediaStreamSource(stream);
          const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

          analyser.smoothingTimeConstant = 0.8;
          analyser.fftSize = 1024;

          microphone.connect(analyser);
          analyser.connect(javascriptNode);
          javascriptNode.connect(audioContext.destination);

          javascriptNode.onaudioprocess = () => {
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            const values = array.reduce((a, b) => a + b);
            const average = values / array.length;
            setTestVolume(average);
          };

          audio = new Audio();
          audio.srcObject = stream;
          audio.play();
        })
        .catch((err) => {
          showNotification({
            title: "Error",
            message:
              err.message ??
              "An unknown error occurred while retrieving the input stream.",
            icon: <HiXCircle />,
          });
        });
    } else {
      testStream?.getTracks().forEach((track) => track.stop());
      audio?.pause();
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      getInputDevices();
    }
  }, []);

  return (
    <SettingsTab tabTitle="Voice" tabValue="voice">
      <Stack spacing={16}>
        <SideBySide
          icon={<HiMicrophone />}
          title="Microphone"
          description="Select the microphone you want to use for voice chat."
          right={
            <Select
              label="Microphone"
              description="Choose a microphone"
              placeholder="Select a microphone"
              data={options ?? []}
              value={micId}
              onChange={(value) => setMicId(String(value))}
              nothingFound="No microphones found"
              disabled={!hasPermission}
            />
          }
          actions={
            hasPermission ? undefined : (
              <Alert title="No permission">
                You need to give permission to enumerate devices to change your
                microphone.{" "}
                <Anchor
                  onClick={() => {
                    if (navigator.mediaDevices === undefined) {
                      showNotification({
                        title: "Unsupported",
                        message:
                          "Your browser does not support the required API for voice chat. This is prevalent on Safari and iOS.",
                        icon: <HiXCircle />,
                      });
                      return;
                    }
                    navigator.mediaDevices
                      .getUserMedia({ audio: true })
                      .then(() => {
                        getInputDevices();
                      });
                  }}
                >
                  Grant permission
                </Anchor>
              </Alert>
            )
          }
          noUpperBorder
          shaded
        />
        <SideBySide
          icon={<HiBeaker />}
          title="Test"
          description="Test your microphone to make sure it's working."
          right={
            <>
              <Button
                fullWidth
                onClick={() => testInput()}
                disabled={!hasPermission}
              >
                {testingInput ? "Stop" : "Test"}
              </Button>
              {testingInput && <Progress value={testVolume} mt={12} />}
            </>
          }
          noUpperBorder
          shaded
        />
      </Stack>
    </SettingsTab>
  );
};

export default VoiceTab;
