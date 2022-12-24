import speakeasy from "speakeasy";
import prisma from "./prisma";

const generateOTP = async (uid: number) => {
  const { ascii, hex, base32, otpauth_url } = speakeasy.generateSecret({
    issuer: "framework.soodam.rocks",
    name: "support@soodam.rocks",
    length: 15,
  });

  await prisma.user.update({
    where: { id: uid },
    data: {
      otpAscii: ascii,
      otpAuthUrl: otpauth_url,
      otpBase32: base32,
      otpHex: hex,
    },
  });

  return {
    base32,
    otpauth_url,
  };
};

const verifyOTP = async (uid: number, token: string) => {
  const user = await prisma.user.findUnique({
    where: { id: uid },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const verified = speakeasy.totp.verify({
    secret: user.otpBase32!,
    encoding: "base32",
    token: token,
    window: 1,
  });

  if (!verified) {
    throw new Error("Invalid token");
  }

  await prisma.user.update({
    where: { id: uid },
    data: {
      otpEnabled: true,
      otpVerified: true,
    },
  });

  return true;
};

const disableOTP = async (uid: number) => {
  await prisma.user.update({
    where: { id: uid },
    data: {
      otpEnabled: false,
      otpVerified: false,
    },
  });

  return true;
};

export { generateOTP, verifyOTP, disableOTP };
