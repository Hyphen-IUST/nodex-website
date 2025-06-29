# NodeX - Student Tech Club @ IUST Kashmir

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-1.0-fbf0df?style=flat-square&logo=bun)](https://bun.sh/)
[![PocketBase](https://img.shields.io/badge/PocketBase-0.20-b794f6?style=flat-square)](https://pocketbase.io/)

> The official website for NodeX - A student-led tech community at Islamic University of Science & Technology, Kashmir, fostering innovation, collaboration, and technical excellence.

## 🌟 Features

- **🎨 Modern UI/UX** - Built with shadcn/ui components and Tailwind CSS
- **🌙 Dark/Light Mode** - Seamless theme switching with next-themes
- **📱 Responsive Design** - Mobile-first approach with adaptive layouts
- **⚡ Performance Optimized** - Server-side rendering with Next.js 14
- **🔐 Authentication System** - Secure recruiter authentication with PocketBase
- **🎯 Application Management** - Complete recruitment workflow system
- **♿ Accessibility Focused** - WCAG compliant design patterns

## 🛠️ Tech Stack

### Frontend

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Re-usable component library
- **[Lucide Icons](https://lucide.dev/)** - Beautiful & consistent icons
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Theme management

### Backend & Database

- **[PocketBase](https://pocketbase.io/)** - Open source backend as a service
- **Collections**: `nodex_apps`, `recruiters`, `marked_apps`, `nodex_team`, `nodex_events`

### Development Tools

- **[Bun](https://bun.sh/)** - Fast JavaScript runtime & package manager
- **[ESLint](https://eslint.org/)** - Code linting and formatting
- **[PostCSS](https://postcss.org/)** - CSS processing

## 🏗️ Project Structure

```
nodex/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth-check/          # Authentication verification
│   │   ├── applications/        # Application management
│   │   ├── events/             # Events data
│   │   ├── join/               # Application submission
│   │   ├── login/              # Recruiter authentication
│   │   ├── mark-application/   # Application approval/rejection
│   │   ├── rollback-application/ # Application rollback
│   │   └── team/               # Team member data
│   ├── components/             # Reusable components
│   │   ├── global/             # Layout components
│   │   └── ui/                 # UI components (shadcn/ui)
│   ├── departments/            # Departments page
│   ├── events/                 # Events page
│   ├── join/                   # Application form
│   ├── recruitment/            # Recruiter dashboard
│   │   └── login/              # Recruiter login
│   ├── team/                   # Team page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   ├── not-found.tsx           # 404 page
│   └── page.tsx                # Home page
├── hooks/                      # Custom React hooks
├── lib/                        # Utility functions
├── public/                     # Static assets
└── configuration files
```

## 🚀 Getting Started

### Prerequisites

- **[Bun](https://bun.sh/)** (v1.0 or higher)
- **[PocketBase](https://pocketbase.io/)** server instance
- **Node.js** (v18 or higher) - for compatibility

### 1. Clone the Repository

```bash
git clone https://github.com/nodex-iust/nodeX-website.git
cd nodeX-website
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# PocketBase Configuration
POCKETBASE_URL=http://127.0.0.1:8090

# Optional: Additional environment variables
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. PocketBase Setup

1. Download and run PocketBase server
2. Create the following collections:
   - `nodex_apps` - Application submissions
   - `recruiters` - Authorized recruiters
   - `marked_apps` - Application status tracking
   - `nodex_team` - Team member profiles
   - `nodex_events` - Events and workshops

### 5. Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
bun run build
bun run start
```

## 📋 Available Scripts

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
```

## 🗄️ Database Schema

### Collections Overview

#### `nodex_apps` - Application Management

- Student applications with personal details
- Department preferences and experience
- Modification history and status tracking

#### `recruiters` - Authentication

- Authorized recruiter credentials
- Role-based access control

#### `nodex_team` - Team Profiles

- Member categories (exec, direc, lead, faculty)
- Rich text descriptions and qualifications
- Social links and contact information

#### `nodex_events` - Event Management

- Active and archived events
- Registration links and capacity management
- Rich text descriptions with categories

## 🎨 UI Components

### Custom Components

- **PageLoading** - Consistent loading states
- **RichTextRenderer** - Markdown-like text rendering
- **ThemeToggle** - Dark/light mode switcher
- **Toast System** - User feedback notifications

### Layout Components

- **Header** - Navigation with responsive mobile menu
- **Footer** - Branding and information
- **Modular Sections** - Reusable page sections

## 🔐 Authentication Flow

1. **Recruiter Login** - Secure key-based authentication
2. **Session Management** - Cookie-based session storage
3. **Protected Routes** - Middleware-based route protection
4. **Role Verification** - PocketBase integration for user roles

## 🤝 Contributing

We welcome contributions from the community! Here's how you can get involved:

### 1. Fork & Clone

```bash
git fork https://github.com/nodex-iust/nodeX-website.git
git clone https://github.com/your-username/nodeX-website.git
cd nodeX-website
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Development Guidelines

- **Code Style**: Follow the existing TypeScript and React patterns
- **Components**: Use shadcn/ui components when possible
- **Styling**: Prefer Tailwind CSS utility classes
- **Types**: Maintain strong TypeScript typing
- **Accessibility**: Ensure WCAG compliance

### 4. Testing Your Changes

```bash
bun install
bun run dev
```

### 5. Commit & Push

```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 6. Create Pull Request

- Provide a clear description of changes
- Include screenshots for UI changes
- Reference any related issues

### 🐛 Bug Reports

Found a bug? Please create an issue with:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### 💡 Feature Requests

Have an idea? Open an issue with:

- Clear feature description
- Use case explanation
- Implementation suggestions

## 📚 Documentation

- **[Next.js Documentation](https://nextjs.org/docs)**
- **[shadcn/ui Components](https://ui.shadcn.com/docs)**
- **[Tailwind CSS](https://tailwindcss.com/docs)**
- **[PocketBase Documentation](https://pocketbase.io/docs/)**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- **NodeX Community** - For continuous support and feedback
- **IUST Kashmir** - For providing the platform
- **Open Source Community** - For amazing tools and libraries

## 📞 Contact

- **Website**: [nodex.iust.cc](https://nodex.iust.cc)
- **Email**: nodex@iust.cc
- **GitHub**: [@nodex-iust](https://github.com/nodex-iust)

---

<div align="center">
  <p>Built with ❤️ by the NodeX team</p>
  <p>© 2025 NodeX - IUST Kashmir. All rights reserved.</p>
</div>
