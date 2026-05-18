# ✍️ Minutes.ai - Intelligent Workspace & Automated MOM

Welcome to **Minutes.ai**, a premium, high-fidelity web application designed to transform raw meeting recordings, chats, and unstructured notes into synthesized, high-impact **Minutes of Meeting (MOM)** layouts.

This project is tailored to support both a premium **Next.js + Tailwind CSS** interactive web client and **Python-based automation modules** for seamless email distribution and Workspace delivery.

---

## 🚀 Quick Start Guide

To run this application locally on your laptop, follow these simple setup steps:

### 📦 Web Client Setup (Node.js)

The interactive user interface is built on **Next.js 16** and **React 19**.

1. **Install Node.js**: Ensure you have [Node.js (v18 or higher)](https://nodejs.org/) installed.
2. **Install Dependencies**: Open your terminal in the project root directory and run:
   ```bash
   npm install
   ```
3. **Launch Local Server**: Start the hot-reloading local development server:
   ```bash
   npm run dev
   ```
4. **Access Dashboard**: Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

### 🐍 Python Automation Setup (Optional)

For the Google Automation script integrations (distribution, background synthesizers, or folder sync modules):

1. **Install Python**: Ensure [Python (v3.9 or higher)](https://www.python.org/) is installed.
2. **Install Dependencies**: Run the following command in your terminal to fetch the required libraries from `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```

---

## 📂 Project Structure

```text
├── app/                  # Next.js 16 App Router view controllers
│   ├── page.tsx          # Homepage, About, & Creators controller
│   ├── login.tsx         # Premium Sign-in layout
│   ├── signup.tsx        # Premium Account creation layout
│   ├── dashboard.tsx     # Workspace center with recent files & folders
│   ├── team.tsx          # MOM editor, collaborator list, & template settings
│   ├── file.tsx          # Core editor interface
│   ├── trash.tsx         # Trashbin folder panel
│   ├── layout.tsx        # Core page layout container
│   └── globals.css       # Core custom design system tokens
├── public/               # Static resources & local media
│   └── fonts/            # High-fidelity custom Google fonts (Plus Jakarta & Hanken)
├── requirements.txt      # Python environment automation libraries
├── package.json          # Node.js project meta & dependency index
└── README.md             # Developer onboarding manual
```

---

## ✨ Features & Design Tokens

* **Harmonious Palette**: Warm, executive cream and deep organic eggplant tones (`#FFEEDF`, `#FAF6F2`, `#502D55`, `#935073`).
* **Organic Backdrop Glowing Orbs**: Liquid gradient ambient lighting utilizing hardware-accelerated CSS blur filters.
* **Premium Physics**: Responsive scaling and translation physics (`active:scale-[0.98]`) across all action triggers.
* **Intelligent MOM Structure Configurator**: Dynamically set rules for bulleting, tone of voice, action items, and automated distributions.
