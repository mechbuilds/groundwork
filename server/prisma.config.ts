import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    url: "postgresql://postgres:march20,2025!@localhost:5432/groundwork",
  },
});