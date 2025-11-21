# ✨ Custom Simple Icon Generator ✨

<p align="center">
  <img src="https://img.shields.io/badge/Powered%20by-Simple%20Icons-blue?style=for-the-badge&logo=simple-icons&logoColor=white" alt="Simple Icons Badge">
  <img src="https://img.shields.io/badge/Built%20with-React%20%26%20Tailwind-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Badge">
</p>

The **Custom Simple Icon Generator** is a fast, responsive web application designed to empower developers and designers. It allows you to effortlessly search, customize, and download thousands of popular brand icons from the Simple Icons library in various formats (SVG, PNG, ICO) and any color you desire.

---

## 🌟 Core Features

This tool is packed with functionalities to streamline your icon workflow:

| Icon | Feature | Description |
| :---: | :--- | :--- |
| 🎨 | **Dynamic Color Picker** | Instantly apply any hex color to all icons in real-time. |
| 💾 | **Recent Colors** | Save and quickly reuse your favorite color palettes. |
| 🔍 | **Powerful Search** | Filter through over 3000 icons by title or slug with smart sorting. |
| 🖼️ | **Custom Resolution** | Configure raster downloads (PNG and ICO) up to a massive **4096x4096** pixels. |
| 📦 | **Batch Download** | Select multiple icons and download them all efficiently in a single ZIP file. |
| 💻 | **SVG Code Viewer** | Inspect, copy, and download the colored SVG code directly. |
| 📱 | **Responsive Design** | A seamless and intuitive experience across desktop and mobile devices. |

---

## 💡 Detailed Usage Guide

The application's interface is designed for maximum efficiency.

### 1. Finding Your Icon 🔎

Use the search bar at the top to filter the extensive library.

*   **Search:** Type the brand name (e.g., "GitHub") or slug (e.g., "github").
*   **Sorting:** Use the toggle group to sort results by **A-Z** 🔠, **Z-A** 🔤, or **Random** 🎲 order.

### 2. Customizing the Color 🌈

The color controls are central to the customization process.

*   **Color Picker:** Click the main color swatch 🎨 to open the hex color picker and select your desired shade.
*   **Randomize:** Hit the **Shuffle** button 🔀 to apply a random color instantly.
*   **Saving Colors:** Click the **Bookmark** button 🔖 to save the current color to your recent list.
*   **Recent Colors:** Click on any saved color swatch to reuse it, or click the small **X** ❌ to remove it from the list.

### 3. Setting Resolution 📐

For raster formats (PNG and ICO), you can define the output size.

*   Click the resolution button (e.g., **256x256** 🖼️) to open the configuration dialog.
*   Choose a predefined size or enter a custom value up to 4096px.

### 4. Downloading Icons ⬇️

#### A. Individual Download (Icon Card)
Each icon card provides quick download buttons:
*   **SVG:** Downloads the pure vector file, colored with the selected hex code.
*   **PNG:** Downloads a raster image at the configured resolution.
*   **ICO:** Downloads a Windows icon file containing multiple standard resolutions (16, 32, 48, 64px), generated at the configured color.

#### B. Batch Download (ZIP Archive)
1.  **Selection:** Use the checkbox ✅ on the top right of each icon card to select it.
2.  **Batch Sheet:** A floating button appears when 2+ icons are selected. Click it to open the batch panel 📦.
3.  **Download:** Choose your desired format (SVG, PNG, or ICO) and download all selected icons in a single compressed `.zip` file 💾.

---

## ⚙️ Technical Architecture

This application is a modern, client-side React application focused on performance and smooth user experience, leveraging powerful libraries for icon handling and conversion.

### Icon Source Information
We use the official Simple Icons library.

### Core Technologies

<table align="center">
  <tr>
    <td align="center" width="180">
      <a href="https://react.dev/">
        <img src="./public/tech-icons/react.svg" alt="React" width="60" height="60">
        <br>React
      </a>
    </td>
    <td align="center" width="180">
      <a href="https://www.typescriptlang.org/">
        <img src="./public/tech-icons/typescript.svg" alt="TypeScript" width="60" height="60">
        <br>TypeScript
      </a>
    </td>
    <td align="center" width="180">
      <a href="https://tailwindcss.com/">
        <img src="./public/tech-icons/tailwindcss.svg" alt="Tailwind CSS" width="60" height="60">
        <br>Tailwind CSS
      </a>
    </td>
    <td align="center" width="180">
      <a href="https://simpleicons.org/">
        <img src="./public/tech-icons/simpleicons.svg" alt="Simple Icons" width="60" height="60">
        <br>Simple Icons
      </a>
    </td>
  </tr>
  <tr>
    <td align="center" width="180">
      <a href="https://canvg.github.io/">
        <img src="./public/tech-icons/canvag.svg" alt="Canvg" width="60" height="60">
        <br>Canvg (JS)
      </a>
    </td>
    <td align="center" width="180">
      <a href="https://lenis.studiofreight.com/">
        <img src="./public/tech-icons/lenis.svg" alt="Lenis" width="60" height="60">
        <br>Lenis (JS)
      </a>
    </td>
    <td align="center" width="180">
      <a href="https://ui.shadcn.com/">
        <img src="./public/tech-icons/shadcnuisvg.svg" alt="Shadcn/ui" width="60" height="60">
        <br>Shadcn/ui
      </a>
    </td>
    <td align="center" width="180">
      <a href="https://vitejs.dev/">
        <img src="./public/tech-icons/vite.svg" alt="Vite" width="60" height="60">
        <br>Vite
      </a>
    </td>
  </tr>
</table>

---

## 👨‍💻 Development Setup

To run this project locally for development, follow these steps:

### 📦 Prerequisites

Ensure you have Node.js (v18+) and pnpm installed on your system.

### 📝 Steps to Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zKauaFerreira/custom-icon-generator.git
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   pnpm run dev
   ```

The application will be available at `http://localhost:8080`. Happy coding! 🚀

---

## 🤝 Contributing

We welcome contributions! If you find a bug or have a suggestion for a new feature, please feel free to:

1.  Open an **Issue** 🐛 to report bugs or propose enhancements.
2.  Submit a **Pull Request** ⬆️ with your code changes.

---

## 📜 License

This project is licensed under the MIT License.

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge&logo=open-source-initiative" alt="MIT License">
</p>

---

<p align="center">
  Made with 💙 by Kaua~ Ferreira.
</p>