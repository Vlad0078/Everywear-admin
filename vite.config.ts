import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
	server: {
    host: '0.0.0.0', // Дозволяє приймати зовнішні з’єднання
    port: 10000, // Render часто використовує порт 10000 для Web Services
    strictPort: true, // Не дозволяє Vite змінювати порт, якщо він зайнятий
  },
});
