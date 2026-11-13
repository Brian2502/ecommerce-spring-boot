# E-Commerce Backend API

A RESTful e-commerce backend built with **Java 21, Spring Boot 4, PostgreSQL, and Spring Security**.

The application supports product and category management, JWT-based authentication, shopping carts, order processing, and inventory control. It also demonstrates Redis caching, transactional operations, pessimistic locking, and automated testing.

## Tech Stack

- **Backend:** Java 21, Spring Boot 4, Spring Web MVC
- **Security:** Spring Security, JWT
- **Database:** PostgreSQL, Spring Data JPA, Hibernate
- **Caching:** Redis, Spring Cache
- **API Documentation:** Swagger UI, OpenAPI
- **Build Tools:** Maven
- **Testing:** JUnit 5, Mockito, Spring Boot Test
- **DevOps:** Docker, Docker Compose, GitHub Actions

## Features

### Authentication and Authorization
- User registration and login
- JWT-based authentication
- Role-based access control for ADMIN and USER
- Protected REST API endpoints

### Product and Category Management
- Create and manage product categories
- Product CRUD operations
- Product search, filtering, sorting, and pagination
- Request validation and centralized exception handling

### Redis Caching
- Redis caching for product detail retrieval
- Cache expiration with a 10-minute TTL
- Automatic cache eviction when products are updated or deleted
- Reduced repeated database queries for cached product details

### Shopping Cart and Order Management
- Add products to shopping carts
- Manage cart items
- Checkout and create orders with order items
- Calculate order totals
- Track and update order status
- Cancel pending orders and restore product stock
- Transactional checkout operations using `@Transactional`
- Pessimistic locking to prevent concurrent overselling

### API Documentation
- Interactive API documentation with Swagger UI
- OpenAPI specification
- JWT Bearer authentication support in Swagger UI

### Testing
- Unit tests for service-layer business logic
- Integration tests for successful checkout
- Integration tests for insufficient-stock scenarios
- Concurrent checkout testing to prevent overselling
- Transaction rollback testing after database writes
- Automated test execution using Maven

### Continuous Integration
- GitHub Actions workflow triggered by pushes and pull requests to `main`
- Automated build and test execution using Java 21
- PostgreSQL and Redis services for integration testing
- Docker image build verification

## Architecture

The application follows a layered architecture:

`Client → Controller → Service → Repository → PostgreSQL`

Redis provides caching for selected product operations.

- **Controller:** Handles HTTP requests and responses
- **Service:** Implements business logic and transaction management
- **Repository:** Handles database access through Spring Data JPA
- **DTO:** Defines request and response data structures
- **Security:** Handles JWT authentication and authorization

## Prerequisites

- Docker Desktop
- Docker Compose

For development without Docker, install Java 21, Maven, PostgreSQL, and Redis.

## Run with Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/Brian2502/ecommerce-spring-boot.git
cd ecommerce-spring-boot
```

### 2. Create the environment file

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

### 3. Configure environment variables

Edit `.env` using the variable names defined in `.env.example`.

For example:

```dotenv
DB_PASSWORD=your_local_database_password
```

Configure any additional required variables, including JWT settings, according to your application configuration.

Never commit real passwords, JWT secrets, or other credentials.

### 4. Start the application

```bash
docker compose up -d --build
```

### 5. Check container status

```bash
docker compose ps
```

The backend is configured to listen on port `8081`.

To view application logs:

```bash
docker compose logs -f app
```

To stop the containers:

```bash
docker compose down
```

PostgreSQL data can persist in a Docker volume. Avoid using `docker compose down -v` unless you intentionally want to remove stored data.

**Note:** The Docker Compose configuration must include or provide access to a Redis instance for caching to work.

## Local Development

Start PostgreSQL and Redis, then configure the application to connect to them.

For the current local Redis setup:

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6380
```

Run the Spring Boot application from IntelliJ IDEA or with Maven:

```powershell
.\mvnw.cmd spring-boot:run
```

The application will be available at:

`http://localhost:8081`

## API Documentation

Once the application is running, open:

**Swagger UI**

http://localhost:8081/swagger-ui/index.html

**OpenAPI Specification**

http://localhost:8081/v3/api-docs

To test protected endpoints, log in to obtain a JWT and use the **Authorize** button in Swagger UI.

## Testing

Run all tests on Windows:

```powershell
.\mvnw.cmd test
```

On macOS/Linux:

```bash
./mvnw test
```

Run individual integration tests:

```powershell
.\mvnw.cmd "-Dtest=OrderCheckoutIntegrationTest" test
.\mvnw.cmd "-Dtest=OrderConcurrencyTest" test
.\mvnw.cmd "-Dtest=OrderRollbackIntegrationTest" test
.\mvnw.cmd "-Dtest=TransactionRollbackIntegrationTest" test
```

### Integration Test Scenarios

| Test | Purpose |
|---|---|
| OrderCheckoutIntegrationTest | Verifies order creation, order items, stock updates, and cart cleanup |
| OrderConcurrencyTest | Verifies that concurrent checkouts do not oversell inventory |
| OrderRollbackIntegrationTest | Verifies that insufficient stock prevents checkout without changing data |
| TransactionRollbackIntegrationTest | Verifies transaction rollback after database writes and a runtime exception |

The transaction rollback test uses `TransactionTemplate` to verify rollback behavior independently of the checkout service.

## API Overview

The backend provides REST API endpoints for:

- Authentication
- Users
- Categories
- Products
- Shopping carts
- Orders

Protected endpoints require a valid JWT.

## Future Improvements

- Expand integration and API test coverage
- Improve multi-product checkout locking to reduce deadlock risks
- Add production-oriented deployment configuration
- Introduce monitoring and structured logging
- Explore asynchronous order processing with RabbitMQ

## Author

**Ha Hoang Uy Vu**

GitHub: https://github.com/Brian2502