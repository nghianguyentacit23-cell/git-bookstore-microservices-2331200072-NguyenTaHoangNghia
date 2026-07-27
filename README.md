# Bookstore Microservices - Lab 5

Student ID: `2331200072`  
Student name: `Nguyen Ta Hoang Nghia`

Public GitHub repository:  
<https://github.com/nghianguyentacit23-cell/git-bookstore-microservices-2331200072-NguyenTaHoangNghia>

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

Direct service endpoints required by the Lab:

- Product service (`localhost:8002`): `GET /products`, `GET /products/:id`
- User service (`localhost:8001`): `POST /users/register`
- Order service (`localhost:8003`): `POST /orders`

API Gateway endpoints:

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

## Evidence

- [Docker Desktop: all services running](screenshots/01-docker-desktop-services.png)
- [Successful login](screenshots/02-login-success.png)
- [Product created](screenshots/03-product-created.png)
- [Order created](screenshots/04-order-created.png)
- [RabbitMQ event and queue state](screenshots/05-rabbitmq-event-log.png)

## Stop

```bash
docker compose down
```
