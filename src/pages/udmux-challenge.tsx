import DataGrid from "@/components/data-grid";
import { UdmuxData } from "@/util/udmux";
import { Progress, Text, Title } from "@mantine/core";
import { useLocalStorage, useOs } from "@mantine/hooks";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import {
  HiOutlineDesktopComputer,
  HiOutlineServer,
  HiOutlineTag,
} from "react-icons/hi";
import NoSSR from "react-no-ssr";

const UdmuxChallenge: FC = () => {
  const [ip, setIp] = useState<string>("Offline");
  const [rayId, setRayId] = useState<string>("Acquiring...");
  const [progress, setProgress] = useState<number>(0);
  const [udmuxGuard, setUdmuxGuard] = useLocalStorage<UdmuxData>({
    key: "@fw/udmux-guard-seen/@v2",
    defaultValue: {
      lastSeen: 0,
    },
  });

  const os = useOs();
  const router = useRouter();

  useEffect(() => {
    if (
      new Date(udmuxGuard.lastSeen).getTime() >
      Date.now() - 1000 * 60 * 60 * 12
    ) {
      const returnTo = router.query.redirect || "/";
      router.push(String(returnTo));
      return;
    }

    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((json) => setIp(json.ip));

    const uuid = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    setRayId(uuid);

    const timeout = setTimeout(() => {
      const animate = () => {
        const maxIncrement = 20;
        const minIncrement = 5;
        const maxDelay = 100;
        const minDelay = 20;

        const increment =
          Math.random() * (maxIncrement - minIncrement) + minIncrement;
        const delay = Math.random() * (maxDelay - minDelay) + minDelay;

        setProgress((prevProgress) => Math.min(prevProgress + increment, 100));
        setTimeout(animate, delay);
      };
      animate();
    }, 2800);

    return () => clearTimeout(timeout);
  }, [udmuxGuard]);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        setUdmuxGuard({
          lastSeen: Date.now(),
        });
      }, 4500);
    }
  }, [progress]);

  return (
    <NoSSR>
      <main className="w-full h-full flex flex-col justify-center items-center">
        <div className="max-w-2xl py-4 md:my-32 my-12 px-4 w-full h-full">
          <div
            className="absolute md:block hidden inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden sm:top-[-20rem]"
            style={{
              filter: "blur(64px)",
            }}
          >
            <svg
              className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
              viewBox="0 0 1155 678"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
                fillOpacity=".3"
                d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
              />
              <defs>
                <linearGradient
                  id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
                  x1="1155.49"
                  x2="-78.208"
                  y1=".177"
                  y2="474.645"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#9089FC"></stop>
                  <stop offset="1" stopColor="#FF80B5"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-between items-center md:flex-row flex-col">
            <Title order={2}>Solarius Udmux Guard</Title>
            <Text size="sm" color="dimmed">
              Udmux - Solarius © 2021-2023
            </Text>
          </div>
          <Text mt="xl" className="md:text-start text-center">
            We&apos;re sorry! We need to quickly check your browser to help
            protect our site from attacks. It&apos;ll take just a moment.
          </Text>
          <Progress className="mt-8" value={progress} animate color="pink" />
          <DataGrid
            className="md:mt-24 mt-12"
            items={[
              {
                tooltip: "Your IP",
                value: ip || "Offline",
                icon: <HiOutlineServer />,
              },
              {
                tooltip: "Ray ID",
                value: rayId || "Acquiring...",
                icon: <HiOutlineTag />,
              },
              {
                tooltip: "Operating System",
                value:
                  os === "android"
                    ? "Android"
                    : os === "ios"
                    ? "iOS"
                    : os === "macos"
                    ? "macOS"
                    : os === "windows"
                    ? "Windows"
                    : "Unknown",
                icon: <HiOutlineDesktopComputer />,
              },
            ]}
          />
        </div>
      </main>
    </NoSSR>
  );
};

export default UdmuxChallenge;
