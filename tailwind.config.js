/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all files that contain Nativewind classes.
    content: [
        "./app/**/*.jsx",
        "./components/**/*.{js,jsx,ts,tsx}",
        "./forms/**/*.jsx",
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {},
    },
    plugins: [],
};
