import type { Config } from "tailwindcss"

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        app: ["system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}

export default config