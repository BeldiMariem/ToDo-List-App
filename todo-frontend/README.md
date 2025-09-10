# 📝 ToDo List App - Frontend
A modern, responsive ToDo List application built with Angular and its new standalone components. It features social login, real-time updates, containerized with **Docker**, and a robust CI/CD pipeline powered by **Jenkins**.

## 🌟 Key Features
- **Modern Angular**: Built with Angular 20+ using standalone components and signals for a streamlined development experience.
- **Responsive UI**: Clean and adaptive interface crafted with Angular Material.
- **Secure Authentication**: Email/password login and Google OAuth integration using JWT.
- **Real-Time notification**: Live task updates powered by WebSocket (STOMP) for a seamless user experience.
- **Calendar Integration**: Visualize and manage tasks with an integrated calendar view.
- **Comprehensive Testing**: Full test suite including unit, component, and end-to-end tests with Karma/Jasmine and Cypress.
- **CI/CD Automation**: Fully automated build, test, and deployment pipeline via Jenkins.
- **Containerized**: Easy deployment and scalability with Docker.

## ⚙️ Tech Stack

| Tool           | Purpose                        |
|----------------|--------------------------------|
| Angular 20+	 | Frontend framework with standalone components |
| TypeScript	 | Type-safe JavaScript superset  | 
| RxJS           | Reactive programming library   |
| Angularx Social Login | Social media authentication |
| Angular Calendar | Calendar component for task management |
| WebSocket/STOMP | Real-time communication with backend |
| Karma + Jasmine |	Unit and component testing    |
| Cypress	     | End-to-end (E2E) testing       |  
| Docker & Compose |	Containerization & orchestration |
| Jenkins        | Continuous Integration / Continuous Deployment (CI/CD) pipelines |
| ESLint         | Code linting and quality |
| Docker Hub     | Container registry for Docker images |

## 🏗️ Project Structure

```text
todo-frontend/
├── src/
│   ├── app/
│   │   ├── components/         # Standalone components
│   │   ├── core/
│   │   │   ├── services      # Angular services
│   │   │   ├── models/       # TypeScript interfaces
│   │   │   └── pipes/        # Custom angular pipes  
│   │   ├── layouts/          # Main layout components  
│   │   ├── guards/           # Route guards
│   │   ├── interceptors/     # HTTP interceptors
│   │   └── utils/            # Utility functions
│   ├── assets/              # Static assets
│   └── styles/              # Global styles
├── Dockerfile               # Docker configuration
├── Jenkinsfile             # CI/CD pipeline
└── package.json            # Dependencies and scripts
```
## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Angular CLI 20+
- Docker (optional)
- Jenkins (for CI/CD)

## Installation

**1. Clone the repository:**
```bash
git clone https://github.com/BeldiMariem/ToDo-List-App.git
cd todo-frontend
```
**2. Install dependencies:**
```bash
npm install
```
**3. Configure environment:**
Create src/environments/environment.ts and environment.prod.ts:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  apiBaseUrl: 'http://localhost:8080'
};
```
**4. Run the development server:**
```bash
ng serve
```

## 🐳 Docker Setup
The application is containerized using Docker. To build and run:
```bash
# Build the image
docker build -t todo-frontend .

# Run the container
docker run -p 4200:80 todo-frontend
```

## 🔄 Continuous Integration & Deployment

This project uses **Jenkins** to automate the frontend build, test, and deployment process using a **CI/CD pipeline**.  

- **Checkout** - Pulls code from GitHub repository
- **Install Dependencies** - Runs npm install
- **Lint** - Executes ESLint for code quality checks
- **Test** – Runs unit tests, component tests (Karma/Jasmine), and Cypress E2E tests to ensure stability
- **Build Angular** - Creates production build with ng build
- **Docker Build & Push** - Builds and pushes Docker image to Docker Hub (main branch only)

## 🌱 Branch Behavior

- **`main` branch** → Docker image push.  
- **Other branches** → Only builds and runs tests. This prevents unfinished work from affecting production.

### 🔑 Credentials Required in Jenkins

To make this all work smoothly, Jenkins uses:
- **Docker Hub credentials (`dockerhub-credentials`)** → For logging in and pushing Docker images.

### 🌍 GitHub Webhook with ngrok

Since Jenkins is running locally, GitHub cannot reach it directly on `http://localhost:8080`.  
To solve this, I used **ngrok** to expose Jenkins over the internet.
This lets GitHub send webhook events (pushes, PRs, etc.) to my local Jenkins as if it were on a real server. 🚀

### 💡Why This Setup?

I designed it this way to minimize manual steps, prevent mistakes, and ensure that the backend is always tested, packaged, and ready to run. Every commit is either verified in a test environment or fully deployed, depending on the branch. It’s all about **speed, reliability, and confidence** in the code.

##  Clean Code Approach
I made a conscious effort to follow clean code principles to ensure the code is easy to read, maintain, and extend. I believe that well-written code should speak for itself, so I focused on making it clear and intuitive, minimizing the need for comments. I spent time ensuring that variables and functions have names that clearly describe their purpose, which helps anyone reading the code understand what’s happening right away.

This approach ensures that anyone reviewing or extending the project can quickly understand the logic and confidently make changes without confusion.
## ✅ Unit & Component Tests

The frontend application is thoroughly tested to ensure reliability and maintainability.

### 🧪 Unit Tests
- Implemented with **Jasmine & Karma**
- Focused on **services**
- Ensure that business logic and state management behave correctly in isolation

### 🧩 Component Tests
- Standalone components are tested for:
  - Proper rendering of UI elements
  - Input/output bindings
  - DOM interactions and event handling

## 🌐 End-to-End (E2E) Tests with Cypress
- Cypress configured for Angular application testing
- Registration flow thoroughly tested including:
    - Form validation and error messaging
    - Password strength evaluation
    - API integration with mocked responses
    - Loading states and redirect behavior
    - Error handling for failed registration attempts
- Custom commands and type definitions created for maintainable tests
- Comprehensive test coverage for user registration journey



###  👩‍💻 Developed with ❤️ by Mariem BELDI.



