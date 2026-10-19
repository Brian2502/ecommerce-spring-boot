
# E-Commerce Backend API

A RESTful e-commerce backend built with Java and Spring Boot. The project provides APIs for product management, authentication, shopping carts, and order processing.

## Tech Stack

- Java 21
- Spring Boot 4
- Spring Security and JWT
- Spring Data JPA and Hibernate
- PostgreSQL
- Maven
- Docker and Docker Compose
- JUnit and Mockito

## Features

### Authentication and Authorization
- User registration and login
- JWT-based authentication
- Role-based access control for ADMIN and USER

### Product and Category Management
- Create and manage product categories
- Product management
- Product search, filtering, sorting, and pagination
- Request validation and centralized exception handling

### Shopping Cart and Orders
- Add products to a shopping cart
- Manage cart items
- Checkout and create orders
- Track order status
- Cancel orders and restore product stock
- Pessimistic locking for product stock updates

### Testing
- Unit tests for service-layer business logic
- Maven test execution

## Architecture

The application follows a layered architecture:

Client → Controller → Service → Repository → PostgreSQL

DTOs are used to handle API requests and responses, while Spring Data JPA and Hibernate manage database persistence.

## Prerequisites

- Docker Desktop
- Docker Compose

For local development without Docker, install Java 21, Maven, and PostgreSQL.

## Run with Docker Compose

1. Clone the repository:

   ```bash
   git clone <YOUR_GITHUB_REPOSITORY_URL>
   cd ecommerce
   ```

2. Create your local environment file:

   ```bash
   Copy-Item .env.example .env
   ```

3. Edit `.env` and set a secure database password:

   ```dotenv
   DB_PASSWORD=your_local_database_password
   ```

   Use the same password for your local environment configuration. Do not commit `.env`.

4. Start the application and database:

   ```bash
   docker compose up -d --build
   ```

5. Check container status:

   ```bash
   docker compose ps
   ```

The backend listens on port `8081`. The PostgreSQL container is exposed on host port `5433`.

To view application logs:

```bash
docker compose logs -f app
```

To stop the containers:

```bash
docker compose down
```

The PostgreSQL data is stored in a Docker volume so it can persist when containers are stopped or recreated. Do not use `docker compose down -v` unless you intentionally want to remove that volume.

## Configuration

Database settings are supplied through environment variables. See `.env.example` for the required configuration.

Never commit database passwords, JWT secrets, or other credentials.

## Testing

Run the test suite using the Maven Wrapper:

```bash
.\mvnw.cmd test
```

## API Overview

The backend includes API areas for:

- Authentication
- Users
- Categories
- Products
- Shopping carts
- Orders

Use your preferred API client to send requests to the running backend. Authentication-protected endpoints require a valid JWT.

## Future Improvements

- API documentation with OpenAPI/Swagger
- CI pipeline for automated testing
- Additional integration tests
- Production-oriented deployment configuration
