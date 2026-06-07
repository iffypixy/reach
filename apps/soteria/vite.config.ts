import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"~": "/src",
		},
	},
	server: {
		host: true,
		proxy: {
			"/api": "http://localhost:3001",
		},
	},
});
