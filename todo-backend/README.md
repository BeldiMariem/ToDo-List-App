# 📝 ToDo List App - Backend
This is the backend for a ToDo List application, containerized with **Docker**, and built with **Spring Boot**, **Java 21**, **PostgreSQL**, **JWT authentication**, **Swagger**, **MapStruct DTOs**, **WebSocket real-time notifications**, **email services**, and a clean service-based architecture.

## 📌 Key Features

- Dockerized backend and database using Docker Compose
- JWT-based authentication and authorization
- User management (register, login, update, delete)
- Board creation and member management
- List and card creation within boards
- Comments on cards
- Real-time notifications using WebSocket
- Swagger API documentation
- DTO separation using MapStruct
- Controller testing using **MockMvc** and **H2 database**
- Continuous Integration & Deployment using **Jenkins** and **Nexus**
- Forgot password functionality
   - Backend endpoints for requesting a password reset and updating the password
   - Sends a password reset email to the user
## ⚙️ Tech Stack

| Tool           | Purpose                        |
|----------------|--------------------------------|
| Spring Boot    | Main backend framework         |
| WebSocket/STOMP |	Real-time notifications      | 
| PostgreSQL     | Main relational database       |
| JavaMail / Spring Mail | Sending emails for password reset |
| Spring Security| JWT authentication             |
| MapStruct      | Entity ↔ DTO mapping           |
| Swagger (OpenAPI) | API documentation         |
| JUnit & MockMvc| REST controller testing        |
| Docker & Compose |	Containerization & orchestration |
| Jenkins        | Continuous Integration / Continuous Deployment (CI/CD) pipelines |
| Nexus          | Artifact repository for storing built Maven packages |
| Docker Hub     | Container registry for Docker images |

## 🔔 Real-Time Notifications with WebSocket
The application now includes real-time notifications using Spring WebSocket and STOMP protocol. This enables instant updates across connected clients when changes occur in the system.

### WebSocket Features:
- Real-time board updates: Users receive instant notifications when boards are created, updated, or deleted
- Live card movements: Get notified when cards are moved between lists or updated
- Comment notifications: Receive real-time alerts when new comments are added to cards
- Collaborative editing: Multiple users can work on the same board simultaneously with live updates

## 🔄 Continuous Integration & Deployment

This project uses **Jenkins** to automate the backend build, test, and deployment process using a **CI/CD pipeline**.  

- Automated build and test for every commit using **Maven**
- Automated deployment to **Nexus repository** for main branch builds
- Docker images are built and pushed to **Docker Hub** for main branch builds
- Branch-specific stages: only main triggers deployment and Docker push
- Ensures code quality and faster delivery with minimal manual steps


### 🛠 CI/CD Pipeline

To make sure our backend is always up-to-date, tested, and ready to deploy, I set up a **Jenkins pipeline** that automates most of the work for us. Here’s how it works:

1. **Build**  
   First, Jenkins compiles the project using Maven. I skip the tests at this stage to make the build faster—no one likes waiting too long for a simple compilation.

2. **Unit Tests**  
   Next, all the service classes and business logic are tested in an isolated environment. This ensures that any code we write behaves as expected before it ever reaches production.

3. **Deploy to Nexus**  
   Once everything passes, if the commit is on the **main branch**, the pipeline automatically deploys the built artifacts to **Nexus**. This way, our Maven packages are safely stored and versioned, ready for other projects or future use.


4. **Docker Build & Push**  
   At the same time, Jenkins builds a **Docker image** for the backend and pushes it to **Docker Hub**, but only from the main branch. This ensures that our production-ready image is always up-to-date without accidentally overwriting in-progress feature branches.


5. **Post Actions**  
   Finally, Jenkins prints clear messages in the logs to show whether everything succeeded or if something went wrong. This makes it easy to track the pipeline status at a glance.

## 🌱 Branch Behavior

- **`main` branch** → Triggers deployment to **Nexus** and Docker image push.  
- **Other branches** → Only builds and runs tests. This prevents unfinished work from affecting production.

### 🔑 Credentials Required in Jenkins

To make this all work smoothly, Jenkins uses:

- **Maven settings (`maven-settings`)** → For authenticating and deploying to Nexus.  
- **Docker Hub credentials (`dockerhub-credentials`)** → For logging in and pushing Docker images.

### 🌍 GitHub Webhook with ngrok

Since Jenkins is running locally, GitHub cannot reach it directly on `http://localhost:8080`.  
To solve this, I used **ngrok** to expose Jenkins over the internet.
This lets GitHub send webhook events (pushes, PRs, etc.) to my local Jenkins as if it were on a real server. 🚀

### 💡Why This Setup?

I designed it this way to minimize manual steps, prevent mistakes, and ensure that the backend is always tested, packaged, and ready to run. Every commit is either verified in a test environment or fully deployed, depending on the branch. It’s all about **speed, reliability, and confidence** in the code.

## ✅ Controller Tests

All REST controllers are tested using standalone MockMvc setup with proper exception handling registration

This approach ensures that:
- Controller endpoints are properly mapped and tested
- Exception handlers are registered and functional
- No unnecessary context loading during tests
- Fast and isolated test execution

## 🧪 Unit Tests for Services
In addition to controller tests, each service class has its own unit tests using JUnit and Mockito, ensuring business logic correctness in isolation.

##  Clean Code Approach
I made a conscious effort to follow clean code principles to ensure the code is easy to read, maintain, and extend. I believe that well-written code should speak for itself, so I focused on making it clear and intuitive, minimizing the need for comments. I spent time ensuring that variables and functions have names that clearly describe their purpose, which helps anyone reading the code understand what’s happening right away.

This approach ensures that anyone reviewing or extending the project can quickly understand the logic and confidently make changes without confusion.

## 📂 Project Structure

```text
todo-backend
│
├── controllers       # REST endpoints
├── dtos              # Data Transfer Objects
├── entities          # JPA entities
├── repositories      # Database interfaces
├── services          # Business logic
├── mappers           # MapStruct interfaces for DTO ↔ Entity mapping
├── exceptions        # Custom exceptions and global exception handling
├── security          # JWT and Security config
└── config            # Swagger, CORS, etc.

```
## 🚀 Getting Started

 **1. Clone the repository:**

```bash
git clone https://github.com/BeldiMariem/ToDo-List-App.git
```

**2. Configure the application properties:**

Create a file named application.properties in the src/main/resources/ directory and add the following content:

```bash
spring.application.name=todo-backend

# Database Configuration (PostgreSQL)
spring.datasource.url=jdbc:postgresql://postgres:5432/todo_db
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Configuration - Generate a secure secret key
jwt.secret=YOUR_SECURE_JWT_SECRET_KEY_HERE
jwt.expiration=86400000

# Google OAuth2 Configuration - Register your app in Google Cloud Console
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
spring.security.oauth2.client.registration.google.scope=email,profile
spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:8080/login/oauth2/code/google
frontend.redirect-url=http://localhost:4200/oauth2/redirect

# Email Configuration - Use your email service credentials
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=YOUR_EMAIL@gmail.com
spring.mail.password=YOUR_APP_PASSWORD
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Logging Configuration
logging.level.com.example.todo_backend.websocket=DEBUG
logging.level.org.springframework.web.socket.handler=INFO
logging.file.name=logs/application.log
logging.file.max-size=10MB
logging.file.max-history=30

logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n
logging.pattern.file=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n

logging.level.org.springframework.web.socket=DEBUG
logging.level.com.example.todo_backend.config=DEBUG
```

**3. Run the Application with Docker Compose:**
```bash
docker-compose up --build -d
```
💡 This will start both the PostgreSQL database and the Spring Boot backend app.

**4. Access Swagger UI:**
```bash
http://localhost:8080/swagger-ui/index.html
```


## ⚙️ Test Environment Configuration
To run the backend tests, the application uses an **in-memory H2 database** and custom JWT config. Below is the application-test.properties configuration:

```properties
spring.application.name=todo-backend-test

spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=
spring.datasource.password=

spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=false

jwt.secret=test-secret-key-test-secret-key-test-secret-key=
jwt.expiration=60000

spring.test.database.replace=any

```
 ✅ This configuration allows:

    Quick setup with no external database dependency

    Auto-creation and clean-up of schema using create-drop

    Isolated JWT settings for test mode
##

###  👩‍💻 Developed with ❤️ by Mariem BELDI.
