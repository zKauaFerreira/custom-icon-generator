# ✨ Custom Simple Icon Generator ✨

<p align="center">
  <img src="https://img.shields.io/badge/Powered%20by-Simple%20Icons-blue?style=for-the-badge&logo=simple-icons&logoColor=white" alt="Simple Icons Badge">
  <img src="https://img.shields.io/badge/Built%20with-React%20%26%20Tailwind-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Badge">
</p>

The **Custom Simple Icon Generator** is a fast, responsive web application that allows users to search, customize, and download thousands of popular brand icons from the Simple Icons library in various formats (SVG, PNG, ICO) and any color.

---

## 🚀 Key Features

- **🎨 Dynamic Color Picker:** Instantly apply any hex color to all icons.
- **💾 Recent Colors:** Save and quickly reuse your favorite colors.
- **🔍 Powerful Search:** Filter through over 3000 icons by title or slug.
- **🖼️ Custom Resolution:** Configure PNG and ICO downloads up to 4096x4096 pixels.
- **📦 Batch Download:** Select multiple icons and download them all in a single ZIP file.
- **💻 SVG Code Viewer:** Inspect and copy the colored SVG code directly.
- **🌐 Responsive Design:** Seamless experience on desktop and mobile devices.

---

## ⚙️ How to Use

The application provides a simple interface to customize your icons:

### 1. Search and Filter
Use the search bar to find icons by name (e.g., "GitHub") or slug (e.g., "github"). You can sort the results using the A-Z, Z-A, or Random toggles.

### 2. Customize Color
- **Color Picker:** Click the color swatch to open the hex color picker and select your desired color.
- **Randomize:** Use the <kbd>Shuffle</kbd> button to apply a random color.
- **Save/Use Recent:** Use the <kbd>Bookmark</kbd> button to save the current color, or click on a saved color swatch to reuse it.

### 3. Configure Resolution
Click the resolution button (e.g., <kbd>256x256</kbd>) to open the dialog and set the desired size for PNG and ICO downloads. The maximum supported resolution is 4096x4096px.

### 4. Download Icons

#### Individual Download
Each icon card offers three download options:
- **SVG:** Downloads the vector file, colored with the selected hex code.
- **PNG:** Downloads a raster image at the configured resolution.
- **ICO:** Downloads a Windows icon file containing multiple standard resolutions (16, 32, 48, 64px), generated at the configured color.

#### Batch Download
1. **Select Icons:** Use the checkbox on the top right of each icon card to select it.
2. **Open Batch Sheet:** Once two or more icons are selected, a floating button appears at the bottom right showing the count. Click it to open the batch download panel.
3. **Download ZIP:** Choose your desired format (SVG, PNG, or ICO) and download all selected icons in a single compressed file.

---

## 🛠️ Technical Stack

This application is built using modern web technologies:

| Technology | Purpose | Badge |
|---|---|---|
| **React** | Frontend Library | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black&style=flat-square) |
| **TypeScript** | Type Safety | ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square) |
| **Tailwind CSS** | Utility-First Styling | ![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square) |
| **Simple Icons** | Icon Source (v15.21.0) | ![Simple Icons](https://img.shields.io/badge/-Simple_Icons-111111?logo=simple-icons&logoColor=white&style=flat-square) |
| **Canvg** | SVG to Raster Conversion | ![Canvg](https://img.shields.io/badge/-Canvg-FF69B4?logo=javascript&logoColor=white&style=flat-square) |
| **Lenis** | Smooth Scrolling | ![Lenis](https://img.shields.io/badge/-Lenis-000000?logo=javascript&logoColor=white&style=flat-square) |
| **Shadcn/ui** | Component Library | ![Shadcn/ui](https://img.shields.io/badge/-shadcn%2Fui-000000?logo=vercel&logoColor=white&style=flat-square) |

---

## 👨‍💻 Development Setup

To run this project locally, follow these steps:

### 📦 Prerequisites

Ensure you have Node.js (v18+) and pnpm installed.

### 📝 Steps to Run

1. **Clone the repository:**
   ```bash
   git clone [repository-url]
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   pnpm run dev
   ```

The application will be available at `http://localhost:8080`.

---

## 📜 License

This project is licensed under the MIT License.

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-purple?style=for-the-badge&logo=open-source-initiative" alt="MIT License">
</p>

---

<p align="center">
  Made with 💙 by Dyad.
</p>