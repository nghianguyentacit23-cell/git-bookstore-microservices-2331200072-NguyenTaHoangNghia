# Bookstore Microservices - Lab 5

Student ID: `2331200072`  
Student name: `Nguyen Ta Hoang Nghia`

## Architecture

- Frontend: Express static web application
- API Gateway: routes all browser and API requests
- User service: MongoDB, bcrypt password hashing, JWT authentication
- Product service: PostgreSQL product persistence
- Order service: PostgreSQL order persistence and RabbitMQ event publishing

## Run

Requirements: Docker Desktop with Docker Compose.

```bash
docker compose up --build
```

Open the application at <http://localhost:8000>.

RabbitMQ Management is available at <http://localhost:15672> with the default
development credentials `guest` / `guest`.

## API routes

- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/me`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`

When an order is created, `order-service` publishes an `ORDER_CREATED` message
to the durable RabbitMQ queue `order.created`.

## Stop

```bash
docker compose down
```
