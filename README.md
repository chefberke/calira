<div>
  <h1 style="display: flex; align-items: center; gap: 8px;">
    <img src="./public/logo_classic.svg" alt="Lumi Logo" width="32" height="32">
    Lumi
  </h1>
  <p><strong>Simple. Focused. Productive.</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
</div>

---

## About

Lumi is a modern task management application built with Next.js 15 and React 19. It focuses on simplicity and productivity, helping teams organize their work efficiently.

## Features

- Simple task management and tracking
- Team collaboration
- Due date tracking
- Modern, responsive UI
- Secure authentication
- Real-time updates

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** NextAuth.js
- **State Management:** TanStack Query
- **Package Manager:** Bun

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/lumi.git
   cd lumi
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:

   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/lumi"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Set up the database**

   ```bash
   bun run db:generate
   bun run db:push
   ```

5. **Run the development server**

   ```bash
   bun run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/simple`)
3. Commit your changes (`git commit -m 'Add some minimalist things'`)
4. Push to the branch (`git push origin feature/simple`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

<div align="center">
  <p>Made with ❤️ by the Lumi team</p>
</div>
