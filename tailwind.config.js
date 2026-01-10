/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Your custom colors
                main: '#2d3b4b',
                sub: '#59d0d9',
                // Optional "Light" version of main for hover states
                'main-light': '#3d4f63',
            }
        },
    },
    plugins: [],
}