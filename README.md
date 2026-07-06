# Recipe Manager

![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-brightgreen?logo=springboot&logoColor=white)
![Maven](https://img.shields.io/badge/build-Maven-C71A36?logo=apachemaven&logoColor=white)
![H2](https://img.shields.io/badge/database-H2-blue)

A Spring Boot REST API for managing recipes and the people who own them, with role-based access control, centralized error handling, and AOP-based request logging.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Authorization Model](#authorization-model)
- [Error Format](#error-format)
- [Project Structure](#project-structure)
- [Testing](#testing)

## Overview

Recipe Manager is a small, self-contained backend service: each **Person** owns zero or more **Recipes**, and every write to a recipe or a protected endpoint is checked against the requester's role. It's built as a straightforward layered Spring Boot application — controllers, services, repositories — with an H2 file database, so it runs with zero external setup.

## Features

- Full CRUD for **recipes** and **people**
- One-to-many relationship between people and their recipes
- Role-based access control (`ADMIN` / `USER`) enforced via an `X-User-Id` header
- Cross-cutting request/response logging via a Spring AOP `@Around` aspect on the service layer
- Centralized exception handling (`@RestControllerAdvice`) producing a consistent JSON error body
- Persistent, file-based H2 database — data survives restarts
- Docker & Docker Compose support for one-command startup

## Tech Stack

| Layer          | Technology                          |
|----------------|--------------------------------------|
| Language       | Java 17                              |
| Framework      | Spring Boot 3.5 (Web, Data JPA, AOP) |
| Database       | H2 (file-based)                      |
| Boilerplate    | Lombok                               |
| Build tool     | Maven                                |
| Containerization | Docker / Docker Compose            |

## Getting Started

### Prerequisites

- JDK 17+
- (Optional) Docker & Docker Compose

### Run locally

```bash
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080`. The H2 database file is created under `./data/` on first run.

### Run with Docker

```bash
docker-compose up --build
```

This builds the jar in a Maven container, then runs it on a slim JRE image, exposing port `8080` and persisting `./data` as a volume.

### H2 Console

Browse the database at `http://localhost:8080/h2-console`:

| Field       | Value                                     |
|-------------|--------------------------------------------|
| JDBC URL    | `jdbc:h2:file:./data/recipe_manager`       |
| Username    | `sa`                                       |
| Password    | *(empty)*                                  |

## Configuration

Key settings live in [`application.properties`](src/main/resources/application.properties):

| Property                          | Purpose                                  |
|------------------------------------|-------------------------------------------|
| `spring.datasource.url`            | H2 file location                           |
| `spring.jpa.hibernate.ddl-auto`     | `update` — schema auto-managed from entities |
| `spring.jpa.show-sql`              | Logs generated SQL                         |
| `spring.h2.console.enabled`        | Enables the H2 web console                 |
| `logging.file.name`                | Writes application logs to `app.log`       |

## API Reference

All endpoints are prefixed with `/api`. Protected endpoints require an `X-User-Id` header identifying the requester (see [Authorization Model](#authorization-model)).

### People — `/api/people`

| Method | Path                         | Description                          | Auth            |
|--------|------------------------------|----------------------------------------|-----------------|
| GET    | `/api/people`                | List all people                        | —               |
| GET    | `/api/people/{id}`           | Get a person by id                     | —               |
| POST   | `/api/people`                | Create a person (defaults to `USER`)   | —               |
| PUT    | `/api/people/{id}`           | Update a person                        | —               |
| DELETE | `/api/people/{id}`           | Delete a person                        | —               |
| GET    | `/api/people/{id}/recipes`   | List a person's recipes                | `ADMIN` or self |

<details>
<summary>Example: create a person</summary>

```bash
curl -X POST http://localhost:8080/api/people \
  -H "Content-Type: application/json" \
  -d '{"name": "Dana Levi", "email": "dana@example.com", "phone": "0501234567"}'
```

```json
{
  "id": 1,
  "name": "Dana Levi",
  "email": "dana@example.com",
  "phone": "0501234567",
  "role": "USER",
  "recipes": []
}
```
</details>

### Recipes — `/api/recipes`

| Method | Path                              | Description                    | Auth    |
|--------|------------------------------------|----------------------------------|---------|
| GET    | `/api/recipes`                     | List all recipes                 | `ADMIN` |
| GET    | `/api/recipes/{id}`                | Get a recipe by id                | —       |
| POST   | `/api/recipes/person/{personId}`   | Create a recipe for a person       | —       |
| PUT    | `/api/recipes/{id}`                | Update a recipe                   | —       |
| DELETE | `/api/recipes/{id}`                | Delete a recipe                   | —       |

<details>
<summary>Example: create a recipe for person 1</summary>

```bash
curl -X POST http://localhost:8080/api/recipes/person/1 \
  -H "Content-Type: application/json" \
  -d '{
        "title": "Shakshuka",
        "description": "Classic tomato and egg breakfast",
        "ingredients": "tomatoes, eggs, onion, peppers, spices",
        "instructions": "Saute vegetables, add tomatoes, crack in eggs, simmer.",
        "category": "Breakfast",
        "prepTimeMinutes": 25
      }'
```
</details>

<details>
<summary>Example: list all recipes as an admin</summary>

```bash
curl http://localhost:8080/api/recipes -H "X-User-Id: 1"
```
</details>

## Authorization Model

Authorization is intentionally lightweight — there's no login flow or token issuance, only a header-based identity check meant for demonstrating role-based access control:

1. The caller sends `X-User-Id: <personId>` on protected requests.
2. The service looks up that person and checks their `role` field.
3. `ADMIN`-only endpoints (e.g. listing all recipes) reject anyone else with `403 Forbidden`.
4. "Admin or self" endpoints (e.g. viewing a person's recipes) allow the person themselves or an `ADMIN`.
5. A missing or unknown `X-User-Id` also results in `403 Forbidden`.

## Error Format

Errors are returned as a consistent JSON body by the global exception handler:

```json
{
  "timestamp": "2026-07-06T15:20:00",
  "status": 404,
  "error": "Not Found",
  "message": "Recipe not found with id: 99",
  "path": "/api/recipes/99"
}
```

| Status | Cause                                              |
|--------|------------------------------------------------------|
| 404    | Requested person/recipe doesn't exist                |
| 403    | Missing/invalid `X-User-Id`, or insufficient role    |
| 400    | Invalid request argument                              |
| 500    | Unexpected server error                               |

## Project Structure

```
src/main/java/com/yr/recipemanager
├── aspect        # AOP request/response logging around service calls
├── controller    # REST controllers (PersonController, RecipeController)
├── entity        # JPA entities (Person, Recipe)
├── exception     # Custom exceptions + global exception handler
├── repository    # Spring Data JPA repositories
└── service       # Business logic (PersonService, RecipeService)
```

## Testing

```bash
./mvnw test
```

Runs the Spring Boot context-load test suite.
