# 🎬 Tobito Netflix-Bypass 🚀

<p align="center">
  <img src="edge/icons/icon128.png" width="128" height="128" alt="Tobito Netflix-Bypass Icon" />
</p>

<p align="center">
  <b>Bypass Netflix household verification prompts seamlessly for uninterrupted streaming! 🍿</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Author-Tobito-ff0055.svg?style=for-the-badge&logo=github" alt="Author Tobito" />
  <img src="https://img.shields.io/badge/Extension-Tobito%20Netflix--Bypass-0078D4.svg?style=for-the-badge&logo=microsoftedge" alt="Tobito Netflix-Bypass" />
  <img src="https://img.shields.io/badge/Manifest-MV3-brightgreen.svg?style=for-the-badge" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License MIT" />
</p>

---

## ✍️ Author & Credits

> 🌟 **This extension & code is written by [Tobito](https://github.com/Tobito).** 🌟  
> Designed to provide seamless, uninterrupted streaming on Netflix across all device types and locations.

---

## ✨ Features

- 🛡️ **Instant Household Block:** Prevents Netflix "Update Your Household" interstitials from triggering.
- ⚡ **Zero-Latency Response Interception:** Intercepts GraphQL & XHR responses dynamically at `document_start`.
- 🔍 **Smart DOM Safety Net:** Detects and auto-removes any leftover household modal dialogs instantly.
- 🔓 **Page Scroll Auto-Unlock:** Restores smooth scrolling and removes black backdrop overlays automatically.
- 🌐 **Optimized for Microsoft Edge:** Built natively with Manifest V3 support for Microsoft Edge.

---

## 📁 Project Structure

```
Tobito Netflix-Bypass/
├── 🌐 edge/                   # Optimized Microsoft Edge build
│   ├── manifest.json          # Manifest V3 configuration
│   ├── inject_early.js        # Core fetch/XHR response interception
│   ├── content.js             # DOM safety net & modal remover
│   ├── background.js          # Background service worker
│   ├── popup.html/css/js      # Extension popup interface
│   └── icons/                 # Tobito custom icons (16px, 48px, 128px)
├── 📦 FlixBypass-edge/        # Packaged Edge directory
├── 🧩 src/                    # Shared extension core source
├── 🌐 chrome/                 # Chrome build
└── 🦊 firefox/                # Firefox build
```

---

## 🛠️ Installation Guide for Microsoft Edge

Follow these quick steps to install **Tobito Netflix-Bypass** in Microsoft Edge:

1. 📥 **Download / Clone** this repository to your computer.
2. 🌐 Open **Microsoft Edge** and navigate to `edge://extensions/`.
3. ⚙️ Turn **ON** **Developer mode** in the left sidebar menu.
4. 📂 Click **Load unpacked**.
5. 🎯 Select the `edge` folder from the downloaded repository.
6. 🎉 Done! Open [Netflix](https://www.netflix.com) and enjoy uninterrupted streaming!

---

## ⚡ How It Works

Tobito Netflix-Bypass operates using a multi-layer real-time defense strategy:

1. 🛑 **Network Body Interception:** Filters fetch/XHR payloads containing household verification markers before Netflix scripts see them.
2. 🔄 **Dynamic Response Stripping:** Replaces household status payloads with clean responses (`{"data":{}}`) on the fly.
3. 🧹 **DOM Observer Safety Net:** Monitors the page using a `MutationObserver` to remove modal popups and unblock body scrolling.

---

## 📜 License

Distributed under the MIT License. Created with ❤️ by **Tobito**.
