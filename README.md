# 📝 Personal Blog 

A responsive, full-stack personal blog platform built using **Node.js**, **EJS** (Embedded JavaScript) as the templating engine, and **Tailwind CSS** for modern styling. This project enables you to create, manage, and display blog posts dynamically with clean UI and mobile-friendly layout.

## 📸 Features

- 🖊️ Create, edit, and delete blog posts
- 📄 Dynamic page rendering with EJS
- 📱 Responsive design using Tailwind CSS
- 🧭 Clean blog listing and post detail views
- 🔒 Admin-only controls (optional)

## 🛠️ Tech Stack

| Layer         | Technology             |
|---------------|------------------------|
| Backend       | Node.js, Express.js    |
| View Engine   | EJS (Embedded JS)      |
| Styling       | Tailwind CSS           |
| Database      | MySQL                  |

## 🚀 Getting Started

### Prerequisites

- Node.js & npm
- MySQL
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/personal-blog.git
cd personal-blog

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env and fill in DB connection string, port, etc.

# Run the app
npm run dev
```

## 📲 Responsive Layout
- Fully responsive with Tailwind utility classes
- Mobile-first design approach
- Custom breakpoints and theme available in tailwind.config.js
