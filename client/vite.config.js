import { defineConfig} from "vite";
import {qrcode} from "vite-plugin-qrcode";

export default defineConfig({
    base: "./",
    build: {
        minify: "terser"
    },
    plugins: [qrcode()],
    server: {
        host: '0.0.0.0',
        port: 5173,
    },
})