# Bookly Events Platform

![Bookly Events](/client/src/app/favicon.ico)

> A comprehensive event booking solution built for the **Areeb Technology Competition**

## 🌟 Live Demo

- **Main Site**: [https://bookly-events.vercel.app](https://bookly-events.vercel.app)
- **Admin Dashboard**: [https://bookly-events.vercel.app/admin/dashboard](https://bookly-events.vercel.app/admin/dashboard)

## 📌 Project Overview

Bookly Events is a full-stack event booking platform that allows users to discover, browse, and book events while providing event organizers with powerful management tools. The platform features a modern, responsive design with a user-friendly interface and robust backend API.

### Key Features

- **User Features**:

  - Browse and search events by category, date, and location
  - View detailed event information including descriptions, pricing, and availability
  - User authentication and profile management
  - Secure booking process with confirmation and notifications

- **Admin Features**:
  - Comprehensive dashboard for event management
  - Real-time analytics and reporting
  - User management capabilities
  - Content moderation tools

## 🏗️ System Architecture

The project follows a modern microservices architecture with three main components:

```
bookly-events/
├── client/           # Next.js frontend application
├── server/           # NestJS backend API services
└── system-design/    # Architecture diagrams and design documentation
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Git
- MongoDB (local or Atlas)

### Clone the Repository

```bash
# Clone the repository
git clone https://github.com/zeyadlotfy/ATC_01092856547.git

# Navigate to the project directory
cd ATC_01092856547
```

### Setting Up the Client (Frontend)

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend application will be available at `http://localhost:3000`

### Setting Up the Server (Backend API)

```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push the Prisma schema to your MongoDB instance
npx prisma db push

# Start the development server
npm run start:dev
```

The API server will be available at `http://localhost:4000/swagger`

### Running Tests

The backend includes comprehensive test coverage. To run the tests:

```bash
# Navigate to the server directory
cd server

# Run tests
npm run test
```

## 🔄 CI/CD Workflow

The project uses GitHub Actions for continuous integration and deployment:

- Automated testing on pull requests
- Automatic deployment to staging environments for feature branches
- Production deployment triggered on merges to the main branch

## 📱 Deployment

### Frontend Deployment (Vercel)

The frontend is deployed on Vercel for optimal Next.js performance:

1. Connect your Vercel account to your GitHub repository
2. Configure the environment variables in the Vercel dashboard
3. Deploy using the Vercel dashboard or automatic deployments

### Backend Deployment

The backend API can be deployed using Vercel:

1. Navigate to the server directory:

```bash
cd server
```

2. Create or update `vercel.json` with the following configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/main.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/main.ts"
    }
  ]
}
```

3. Ensure your MongoDB connection string is set in Vercel environment variables.

4. Deploy to Vercel:

```bash
vercel
```

5. For production deployment:

```bash
vercel --prod
```

## 📐 System Design

The `system-design` directory contains detailed architectural diagrams and design documentation for the project, including:

- System Architecture Diagrams

## 🔧 Tech Stack

### Frontend

- Next.js (React framework)
- TypeScript
- Tailwind CSS
- Axios (API communication)

### Backend

- NestJS framework
- TypeScript
- MongoDB (database)
- Prisma (ORM)
- Jest (testing)
- JWT Authentication
- Swagger

## 💾 Database Configuration

The project uses Prisma with MongoDB. Here's a basic guide to set up your database:

1. Create a `.env` file in the server directory with your MongoDB connection string:

```
DATABASE_URL="mongodb+srv://username:password@cluster0.example.mongodb.net/bookly?retryWrites=true&w=majority"
```

2. Set up your Prisma schema in `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

// Your models here
```

3. Apply the schema to your database:

```bash
npx prisma db push
```

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

Created by [Zeyad Lotfy] for the Areeb Technology Competition 2025.

## 🙏 Acknowledgements

- The Areeb Technology Competition organizers
- Open source community for the tools and libraries used
- All beta testers who provided valuable feedback

---

Designed and developed with ❤️ for the Areeb Technology Competition
