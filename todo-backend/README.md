# 📝 ToDo List App - Backend

This is the backend for a Trello-like task management application, containerized with **Docker**, and built with **Spring Boot**, **Java 21**, **PostgreSQL**, **H2** (for tests), **JWT authentication**, **Swagger**, **MapStruct DTOs**, and a clean service-based architecture.


## 📌 Key Features

- Dockerized backend and database using Docker Compose
- JWT-based authentication and authorization
- User management (register, login, update, delete)
- Board creation and member management
- List and card creation within boards
- Comments on cards
- Swagger API documentation
- DTO separation using MapStruct
- Controller testing using **MockMvc** and **H2 database**

## ⚙️ Tech Stack

| Tool           | Purpose                        |
|----------------|--------------------------------|
| Spring Boot    | Main backend framework         |
| PostgreSQL     | Main relational database       |
| H2             | In-memory DB for testing       |
| Spring Security| JWT authentication             |
| MapStruct      | Entity ↔ DTO mapping           |
| Swagger (OpenAPI) | API documentation         |
| JUnit & MockMvc| REST controller testing        |
| Docker & Compose |	Containerization & orchestration |


## ✅ Controller Tests

All REST controllers are tested using:

- `@WebMvcTest` for isolated controller tests
- **MockMvc** to simulate HTTP requests/responses
- **H2 database** to ensure realistic test scenarios


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

spring.datasource.url=jdbc:postgresql://localhost:5432/todo_db
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

jwt.secret=YOUR_JWT_SECRET
jwt.expiration=86400000
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

###  👩‍💻 Developed with ❤️ by Mariem BELDI
