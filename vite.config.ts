import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "APP_");
	return {
	  plugins: [vue()],
	  define: {
		"process.env": env,
	  },
	  envPrefix: "APP_",
	  server: {
		host: true,
	  },
	};
  });
