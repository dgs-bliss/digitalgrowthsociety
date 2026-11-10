import { defineConfig } from "tinacms";
import { BlogCollection } from "./collections/blog";
import { CategoryCollection } from "./collections/category";
import { GlobalConfigCollection } from "./collections/global-config";
import { NavigationCollection } from "./collections/navigation";
import { PageCollection } from "./collections/page";
import { UserCollection } from "./collections/user";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  process.env.TINA_BRANCH ||
  process.env.PUBLIC_TINA_BRANCH ||
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF ||
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.WORKERS_CI_BRANCH ||
  process.env.CF_PAGES_BRANCH ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  contentApiUrlOverride: process.env.TINA_DIRECT_CLOUD_CHECK === "1"
    ? undefined
    : process.env.NEXT_PUBLIC_TINA_CONTENT_API_URL,
  branch,

  // Every independently provisioned site must provide its own Tina project credentials.
  // `validate:site` fails before deployment when these are absent.
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
    media: {
    loadCustomStore: async () => {
      const pack = await import("next-tinacms-cloudinary");
      return pack.TinaCloudCloudinaryMediaStore;
    },
  },
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/schema/
  schema: {
    collections: [
      BlogCollection,
      CategoryCollection,
      PageCollection,
      UserCollection,
      NavigationCollection,
      GlobalConfigCollection,
    ],
  },
});
