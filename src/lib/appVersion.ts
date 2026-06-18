import packageJson from "../../package.json";

export const appVersion =
  process.env.NEXT_PUBLIC_APP_VERSION || packageJson.version;
