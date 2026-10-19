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
- GitHub Actions

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

### Testing and CI
- Unit tests for service-layer business logic
- Automated build and test execution with GitHub Actions
- Docker image build verification in CI

## Architecture

The application follows a layered architecture:

`Client → Controller → Service → Repository → PostgreSQL`

DTOs handle API requests and responses, while Spring Data JPA and Hibernate manage database persistence.

## Prerequisites

- Docker Desktop
- Docker Compose

For local development without Docker, install Java 21, Maven, and PostgreSQL.

## Run with Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/Brian2502/ecommerce-spring-boot.git
cd ecommerce-spring-boot
```

### 2. Create your environment file

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

### 3. Configure environment variables

Edit `.env` and set a secure database password:

```dotenv
DB_PASSWORD=your_local_database_password
```

Use the environment variable names defined in `.env.example`. Keep `.env` private and never commit real credentials.

### 4. Build and start the application

```bash
docker compose up -d --build
```

### 5. Check container status

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

PostgreSQL data is stored in a Docker volume and can persist when containers are stopped or recreated. Do not use `docker compose down -v` unless you intentionally want to remove the volume and its data.

## Configuration

Database settings are supplied through environment variables. See `.env.example` for the required configuration.

Never commit database passwords, JWT secrets, or other credentials.

## Testing

Run the test suite using the Maven Wrapper on Windows:

```powershell
.\mvnw.cmd test
```

On macOS/Linux:

```bash
./mvnw test
```

## API Overview

The backend includes API areas for:

- Authentication
- Users
- Categories
- Products
- Shopping carts
- Orders

Use an API client such as Postman to send requests to the running backend. Protected endpoints require a valid JWT.

## Future Improvements

- API documentation with OpenAPI/Swagger
- Additional integration tests
- Production-oriented deployment configuration
- Expand automated test coverage
