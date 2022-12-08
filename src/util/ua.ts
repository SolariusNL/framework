enum OperatingSystem {
  Windows = "WINDOWS",
  MacOS = "MACOS",
  Linux = "LINUX",
  Android = "ANDROID",
  iOS = "IOS",
  Other = "OTHER",
}

enum Device {
  Desktop = "Desktop",
  Mobile = "Mobile",
  Other = "Other",
}

const operatingSystemRegex = {
  windows: /Windows/i,
  macos: /Macintosh/i,
  linux: /Linux/i,
  android: /Android/i,
  ios: /iPhone|iPad|iPod/i,
};

function getOperatingSystemDevice(os: OperatingSystem): Device {
  if (
    os === OperatingSystem.Windows ||
    os === OperatingSystem.MacOS ||
    os === OperatingSystem.Linux
  ) {
    return Device.Desktop;
  }

  if (os === OperatingSystem.Android || os === OperatingSystem.iOS) {
    return Device.Mobile;
  }

  return Device.Other;
}

function getOperatingSystem(userAgent: string): OperatingSystem {
  for (const [key, value] of Object.entries(operatingSystemRegex)) {
    if (value.test(userAgent)) {
      const os =
        Object.keys(OperatingSystem).find((os) => os.toLowerCase() === key) ||
        OperatingSystem.Other;
      return OperatingSystem[os as keyof typeof OperatingSystem];
    }
  }

  return OperatingSystem.Other;
}

function getOperatingSystemString(os: OperatingSystem): string {
  switch (os) {
    case OperatingSystem.Windows:
      return "Windows";
    case OperatingSystem.MacOS:
      return "MacOS";
    case OperatingSystem.Linux:
      return "Linux";
    case OperatingSystem.Android:
      return "Android";
    case OperatingSystem.iOS:
      return "iOS";
    default:
      return "Other";
  }
}

function getOperatingSystemEnumFromString(os: string): OperatingSystem {
  switch (os.toLowerCase()) {
    case "windows":
      return OperatingSystem.Windows;
    case "macos":
      return OperatingSystem.MacOS;
    case "linux":
      return OperatingSystem.Linux;
    case "android":
      return OperatingSystem.Android;
    case "ios":
      return OperatingSystem.iOS;
    default:
      return OperatingSystem.Other;
  }
}

export {
  getOperatingSystem,
  OperatingSystem,
  Device,
  getOperatingSystemDevice,
  getOperatingSystemString,
  getOperatingSystemEnumFromString,
};
