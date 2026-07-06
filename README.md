# Recipe Manager

A Spring Boot REST API for managing recipes and the people who own them, backed by an embedded H2 database.

## Features

- CRUD endpoints for **recipes** and **people**
- Each recipe belongs to a person; a person can have many recipes
- Simple role-based access control (`ADMIN` / `USER`) via an `X-User-Id` request header
- Request/response logging through a Spring AOP aspect
- Centralized exception handling with consistent JSON error responses

## Tech Stack

- Java 17
- Spring Boot 3.5 (Web, Data JPA, AOP)
- H2 (file-based) database
- Lombok
- Maven

## Getting Started

### Prerequisites

- JDK 17+
- (Optional) Docker & Docker Compose

### Run locally

```bash
./mvnw spring-boot:run
```

The app starts on `http://localhost:8080`. The H2 database file is created under `./data/`.

### Run with Docker

```bash
docker-compose up --build
```

### H2 Console

Available at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/recipe_manager`, user: `sa`, no password).

## API Overview

Send the requester's person id via the `X-User-Id` header on endpoints that require authorization.

### People — `/api/people`

| Method | Path                  | Description                          | Auth              |
|--------|-----------------------|---------------------------------------|-------------------|
| GET    | `/api/people`         | List all people                       | -                 |
| GET    | `/api/people/{id}`    | Get a person by id                    | -                 |
| POST   | `/api/people`         | Create a person (defaults to `USER`)  | -                 |
| PUT    | `/api/people/{id}`    | Update a person                       | -                 |
| DELETE | `/api/people/{id}`    | Delete a person                       | -                 |
| GET    | `/api/people/{id}/recipes` | List a person's recipes          | `ADMIN` or self   |

### Recipes — `/api/recipes`

| Method | Path                              | Description              | Auth    |
|--------|------------------------------------|---------------------------|---------|
| GET    | `/api/recipes`                     | List all recipes          | `ADMIN` |
| GET    | `/api/recipes/{id}`                | Get a recipe by id        | -       |
| POST   | `/api/recipes/person/{personId}`   | Create a recipe for a person | -    |
| PUT    | `/api/recipes/{id}`                | Update a recipe           | -       |
| DELETE | `/api/recipes/{id}`                | Delete a recipe           | -       |

## Project Structure

```
src/main/java/com/yr/recipemanager
├── aspect        # AOP logging
├── controller     # REST controllers
├── entity         # JPA entities (Person, Recipe)
├── exception      # Custom exceptions + global handler
├── repository     # Spring Data JPA repositories
└── service        # Business logic
```
