# 📝 ToDo List App - Full Stack AWS Deployment

## 🚀 Live Application
**Access the deployed application here:**  
🔗 **[http://todo-app-alb-911217416.us-east-1.elb.amazonaws.com](http://todo-app-alb-911217416.us-east-1.elb.amazonaws.com)**

---

## 🧪 Quick Testing
**Demo Account for immediate access:**
- **Username**: `mariemBeldi`
- **Password**: `Password..20`

**Alternative Login Methods:**
- 🔐 **Google OAuth** - Sign in with your Google account
- 📝 **New Registration** - Create your own account

---

## 📖 Overview
A modern, collaborative Todo List application featuring real-time updates, built with **Angular** and **Spring Boot**, deployed on **AWS cloud infrastructure**.

## 🎯 Features

### ✨ Core Functionality
- ✅ **Task Management** - Create, edit, and organize tasks
- 👥 **Team Collaboration** - Shared boards and real-time updates  
- 📅 **Calendar Integration** - Visual task planning
- 🔔 **Live Notifications** - Instant updates across devices
- 🌐 **Social Login** - Google OAuth integration
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile devices



### 🛡️ Security & Authentication
- 🔐 JWT-based authentication
- 👤 Multiple login options (Email/Password + Google OAuth)
- 🎪 Secure session management
- 📧 Password reset functionality


## 🏗️ Technical Architecture

### Frontend (User Interface)
| Component | Technology | Deployment |
|-----------|------------|------------|
| **Framework** | Angular 20+ | ECS Fargate |
| **UI Library** | Angular Material | Application Load Balancer |
| **State Management** | RxJS + Signals | Port 80 |
| **Real-time** | WebSocket Client | |

### Backend (Business Logic)
| Component | Technology | Deployment |
|-----------|------------|------------|
| **Framework** | Spring Boot 3.x | ECS Fargate |
| **Database** | PostgreSQL | RDS Instance |
| **Authentication** | JWT + OAuth2 | Application Load Balancer |
| **Real-time** | WebSocket/STOMP | Port 8080 |

### Infrastructure
| Service | Purpose | Configuration |
|---------|---------|---------------|
| **AWS ECS Fargate** | Container Orchestration | Auto-scaling enabled |
| **Application Load Balancer** | Traffic Distribution | Health checks configured |
| **RDS PostgreSQL** | Data Storage | Automated backups |
| **Security Groups** | Network Security | Layer-specific rules |

## 🏗️ Full Deployment Architecture
```mermaid
graph TB
    subgraph "Frontend Pipeline"
        F1[📥 Angular Code] --> F2[📏 ESLint]
        F2 --> F3[🧪 Unit Tests]
        F3 --> F4[⚡ Production Build]
        F4 --> F5[🐳 Docker Image]
    end
    
    subgraph "Backend Pipeline"
        B1[📥 Spring Boot Code] --> B2[🛠️ Maven Build]
        B2 --> B3[🧪 Unit Tests]
        B3 --> B4[📦 Nexus Deploy]
        B4 --> B5[🐳 Docker Image]
    end
    
    F5 --> F6[🚀 ECS Fargate]
    B5 --> B6[🚀 ECS Fargate]
    
    F6 --> ALB1[🌐 Frontend ALB]
    B6 --> ALB2[🔧 Backend ALB]
    
    ALB1 --> User[👤 End User]
    ALB2 --> DB[🗄️ RDS PostgreSQL]
    
    style F6 fill:#c8e6c9
    style B6 fill:#c8e6c9
    style User fill:#fff3e0

```
## 🚀 Getting Started

### 🌐 Access Production
  **1. Open**: [Live Application](http://todo-app-alb-911217416.us-east-1.elb.amazonaws.com)

   **2. Login** using:
   - Demo: `mariemBeldi` / `Password..20`
   - Google account
   - New registration

## 💻 Local Development

### Full Stack with Docker Compose
```bash
# Run entire application with one command
docker-compose up --build -d

# Access the application:
# Frontend: http://localhost:4200
# Backend API: http://localhost:8080  
# API Documentation: http://localhost:8080/swagger-ui/index.html
# Database: PostgreSQL on localhost:5432
```

### Individual Services (Optional)
```bash
# Backend only
cd todo-backend
docker-compose up --build -d

# Frontend only  
cd todo-frontend
npm install && ng serve
```

## ⚙️ System Features

### Backend Capabilities
- **User Management** - Registration, profile updates, authentication
- **Board System** - Create, share, and manage collaborative boards
- **Real-time Messaging** - WebSocket for live updates
- **RESTful API** - Comprehensive endpoints for all operations
- **Email Services** - Password reset
- **Data Validation** - Robust input sanitization

### Frontend Capabilities
- **Reactive Architecture** - Real-time state synchronization between components
- **Hybrid State Management** -  Modern Angular Signals for UI state + RxJS for API operations
- **Type Safety** - Full TypeScript implementation
- **Testing Suite** - Unit, integration, and E2E tests
- **Custom UI Components** - Purpose-built interface for task management
- **Responsive Design** - Optimized experience across all device sizes

## 🔄 CI/CD Pipeline

### Backend Automation
```mermaid
graph LR
    A[📥 Code Commit] --> B[🛠️ Maven Build]
    B --> C[🧪 Tests]
    C --> D[📦 Nexus Deployment]
    D --> E[🐳 Docker Build]
    E --> F[🚀 AWS ECS]
    
    style A fill:#e1f5fe
    style F fill:#c8e6c9
```

### Frontend Automation
```mermaid
graph LR
    A[📥 Code Commit] --> B[📏 ESLint Check]
    B --> C[🧪 Tests]
    C --> D[⚡ Angular Build]
    D --> E[🎯 Cypress E2E]
    E --> F[🐳 Docker Push]
    F --> G[🚀 AWS ECS]
    
    style A fill:#e1f5fe
    style G fill:#c8e6c9
```

## 🛠️ Operational Excellence

### ✅ Current Status
- 🟢 **Frontend**: Fully operational and accessible
- 🟢 **Backend**: All endpoints responding correctly
- 🟢 **Database**: Secure connections established
- 🟢 **Real-time**: WebSocket communications active
- 🟢 **Authentication**: Multiple login methods working

### 📊 Monitoring
- **Health Checks**: Application Load Balancer monitoring
- **Logging**: Centralized logs via CloudWatch
- **Resource Monitoring** - Basic AWS service metrics
- **Service Reliability** - ECS automatic container recovery

### 🔒 Security
- **Network Isolation**: VPC with public/private subnets
- **Access Control**: Security groups with minimal open ports
- **Data Protection**: Encrypted database connections
- **Authentication**: JWT tokens with expiration

## 🎯 Deployment Highlights

### 🚀 Successfully Implemented
- ✅ **Full-stack deployment** on AWS cloud
- ✅ **Containerized applications** with Docker
- ✅ **Load-balanced traffic** for high availability
- ✅ **Database persistence** with RDS PostgreSQL
- ✅ **Automated CI/CD** with Jenkins and Nexus
- ✅ **Real-time capabilities** with WebSocket
- ✅ **Production monitoring** and health checks

### 🔮 Planned Enhancements
- **HTTPS Encryption** - SSL certificate implementation
- **Advanced Caching** - Redis for performance
- **Enhanced Monitoring** - Detailed CloudWatch dashboards
- **Blue-Green Deployment** - Zero-downtime updates
- **Database Optimization** - Read replicas and indexing
- **Security Hardening** - AWS WAF integration



## 📚 Project Documentation

For more detailed information about each component, check the individual documentation:

### Backend Documentation
📖 **[Backend README](./todo-backend/README.md)** - Detailed Spring Boot setup, API documentation, and backend features

### Frontend Documentation  
📖 **[Frontend README](./todo-frontend/README.md)** - Comprehensive Angular setup, component documentation, and frontend features

---

### 👩‍💻 Developed with ❤️ by Mariem BELDI.

 