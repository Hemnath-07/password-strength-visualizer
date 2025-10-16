# password-strength-visualizer
# 🎨 Password Strength Visualizer  
**Turning Password Security into Art.**  

[![Live Demo](https://img.shields.io/badge/🔗%20Live%20Demo-Click%20Here-brightgreen)](https://password-strength-visualizer01.netlify.app/)  
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🧠 Overview

**Password Strength Visualizer** is a privacy-first web app that transforms password security into **real-time generative art.**  
When you type a password, the app:
- **Analyzes** its strength using AI-powered heuristics (via `zxcvbn`).
- **Visualizes** it with unique generative patterns using `p5.js`.
- **Educates** you with instant feedback & concrete improvement tips.

> 🧩 Weak passwords look chaotic — strong ones create harmony.  
> Your security, visualized beautifully.

---

## 🚀 Live Demo
🔗 **Try it here:** [Password Strength Visualizer Demo](https://hemnath-07.github.io/password-strength-visualizer---use-case-description/)  
*(All analysis happens locally — no data leaves your browser.)*

---

## 🎯 Key Features

| Feature | Description |
|----------|--------------|
| 💬 **Real-time Analysis** | Instantly checks strength, entropy, and crack time using `zxcvbn`. |
| 🖼️ **Artistic Visualization** | Generates unique p5.js artwork from your password’s properties. |
| 🧩 **Helpful Suggestions** | Gives plain-language feedback on how to improve security. |
| 📱 **Responsive UI** | Works seamlessly across devices and screen sizes. |
| 🔐 **Privacy-First** | 100% client-side — your password is never stored or sent. |
| 🎨 **Export Artwork** | Save your password art as an image for fun or education. |

---

## ⚙️ Tech Stack

| Category | Tools Used |
|-----------|------------|
| Frontend | HTML5, CSS3, JavaScript (ES6) |
| Libraries | [p5.js](https://p5js.org/) for visuals, [zxcvbn](https://github.com/dropbox/zxcvbn) for password analysis |
| Deployment | GitHub Pages / Netlify |
| Version Control | Git + GitHub |
| Optional Add-ons | GitHub Actions (CI), ESLint, Vercel |

---

## 🧩 How It Works

1. **User Input** – You type a password in the text box.  
2. **Analysis** – `zxcvbn` evaluates entropy, strength (0–4), and guess time.  
3. **Mapping** – Results are mapped to colors, density, and harmony in `p5.js`.  
4. **Visualization** – An evolving generative art pattern appears in real-time.  
5. **Feedback** – Suggestions and crack time estimates are displayed.

> Stronger passwords → smoother, more balanced visuals.  
> Weaker passwords → chaotic, fragmented visuals.

---

## 🖥️ Local Setup

### 🧩 Clone the repository
```bash
git clone https://github.com/Hemnath-07/password-strength-visualizer---use-case-description.git
cd password-strength-visualizer---use-case-description
