# Decision Architecture

## Executive Summary

This architecture defines the technical foundation for the Eccomerce Store, a level 2 greenfield web application. The architecture uses React for frontend, Node.js with Express for backend, and Azure for deployment. All decisions are made to ensure consistent implementation across AI agents.

## Project Initialization

First implementation story should execute:

```bash
# Frontend
npx create-react-app ecommerce-frontend --template typescript
cd ecommerce-frontend
npm install axios react-router-dom

# Backend
mkdir ecommerce-backend
cd ecommerce-backend
npm init -y
npm install express cors helmet dotenv
npm install -D nodemon typescript @types/express @types/cors
```

This establishes the base architecture with these decisions:

- Frontend: React with TypeScript
- Backend: Node.js with Express
- Language: TypeScript for both
- Project Structure: Separate frontend and backend directories

## Decision Summary

| Category           | Decision          | Version  | Affects Epics | Rationale                                 |
| ------------------ | ----------------- | -------- | ------------- | ----------------------------------------- |
| Frontend Framework | React             | 18.0+    | All           | Popular React library for UI              |
| Backend Framework  | Node.js + Express | 18.0+    | Epic 1,2,3    | Simple and scalable backend               |
| Language           | TypeScript        | 5.0+     | All           | Type safety for both frontend and backend |
| Database           | SQLite            | 3.0+     | Epic 1,2,3    | Simple database for level 2 project       |
| Authentication     | JWT               | Manual   | Epic 1        | Custom JWT implementation                 |
| State Management   | React Context     | Built-in | Epic 3        | Simple state management for cart          |
| Deployment         | Azure App Service | Latest   | All           | Cloud deployment platform                 |

## Project Structure

```
ecommerce-store/
├── ecommerce-frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── cart/
│   │   │   ├── products/
│   │   │   └── ui/
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Products.tsx
│   │   │   ├── Cart.tsx
│   │   │   └── Checkout.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── context/
│   │   │   └── CartContext.tsx
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
└── ecommerce-backend/
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   ├── middleware/
    │   ├── config/
    │   └── app.ts
    ├── dist/
    ├── package.json
    └── tsconfig.json
```

## Epic to Architecture Mapping

- **Epic 1: User Authentication and Account Management** → Backend auth routes, JWT middleware, User model
- **Epic 2: Product Catalog and Search** → Backend product API, Frontend product components
- **Epic 3: Shopping Cart and Checkout** → Frontend cart state, Backend order processing

## Technology Stack Details

### Core Technologies

- **Frontend**: React 18+ with TypeScript
- **Backend**: Node.js 18+ with Express.js
- **Database**: SQLite with better-sqlite3
- **Authentication**: JWT tokens with bcrypt for password hashing
- **State Management**: React Context for cart state
- **Deployment**: Azure App Service for both frontend and backend

### Integration Points

- Frontend communicates with backend via REST API
- Authentication tokens stored in localStorage
- Cart state managed in frontend, persisted via API calls
- Checkout processes payment and creates orders via backend

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

### Naming Patterns

- Database tables: snake_case (users, products, orders)
- API routes: RESTful (/api/products, /api/users)
- Components: PascalCase (UserCard, ProductList)
- Files: camelCase (userCard.tsx, productList.tsx)

### Structure Patterns

- Frontend: Feature-based component organization
- Backend: MVC pattern with controllers, models, routes
- API responses: Consistent JSON format
- Error handling: Standardized error responses

### Error Handling

- Backend: Return { error: string, status: number }
- Frontend: Display user-friendly error messages
- Logging: Console for development, structured for production

## Consistency Rules

### Naming Conventions

- **Database**: snake_case for tables and columns
- **API**: RESTful endpoints with plural nouns
- **Components**: PascalCase for React components
- **Files**: camelCase for JavaScript/TypeScript files
- **Variables**: camelCase

### Code Organization

- Frontend: Components by feature, shared in ui/
- Backend: Controllers for business logic, models for data
- Routes: Organized by resource
- Middleware: Authentication and validation

### Error Handling

- Consistent error response format: { success: false, error: string }
- HTTP status codes: 200 for success, 400 for client errors, 500 for server errors
- Frontend error boundaries for React components

### Logging Strategy

- Backend: Winston for structured logging
- Frontend: Console for development
- Error logging with timestamps and context

## Data Architecture

### User Model

- id: INTEGER PRIMARY KEY
- email: TEXT UNIQUE
- password_hash: TEXT
- name: TEXT
- created_at: DATETIME

### Product Model

- id: INTEGER PRIMARY KEY
- name: TEXT
- description: TEXT
- price: REAL
- image_url: TEXT
- created_at: DATETIME

### Order Model

- id: INTEGER PRIMARY KEY
- user_id: INTEGER (foreign key)
- items: TEXT (JSON)
- total: REAL
- status: TEXT
- created_at: DATETIME

## API Contracts

### Authentication API

- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile (protected)

### Products API

- GET /api/products - List products
- GET /api/products/:id - Get product details
- POST /api/products - Create product (admin)

### Orders API

- POST /api/orders - Create order
- GET /api/orders - List user orders
- GET /api/orders/:id - Get order details

## Security Architecture

- JWT authentication with access tokens
- Password hashing with bcrypt
- CORS configured for frontend origin
- Input validation on all endpoints
- HTTPS required in production

## Performance Considerations

- React lazy loading for components
- Backend caching with memory cache
- Database query optimization
- Image optimization for product images
- Response time target: < 2 seconds

## Deployment Architecture

- **Frontend**: Azure Static Web Apps or Azure App Service
- **Backend**: Azure App Service with Node.js runtime
- **Database**: SQLite (can upgrade to Azure SQL Database)
- Environment variables for configuration
- Azure DevOps for CI/CD pipelines

## Development Environment

### Prerequisites

- Node.js 18+
- npm
- Git

### Setup Commands

```bash
# Frontend setup
cd ecommerce-frontend
npm install
npm start

# Backend setup
cd ecommerce-backend
npm install
npm run dev
```

## Architecture Decision Records (ADRs)

### ADR 001: React Frontend

**Decision**: Use React for frontend
**Rationale**: Popular, component-based library for building UIs
**Alternatives Considered**: Vue, Angular
**Impact**: Familiar ecosystem, large community

### ADR 002: Node.js Backend

**Decision**: Use Node.js with Express for backend
**Rationale**: JavaScript full-stack, good performance
**Alternatives Considered**: Python Flask, Java Spring
**Impact**: Unified language stack

### ADR 003: Azure Deployment

**Decision**: Deploy to Azure App Service
**Rationale**: Scalable cloud platform with good Node.js support
**Alternatives Considered**: AWS, GCP
**Impact**: Integrated cloud services

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: 2025-10-21_
_For: Disandu_
