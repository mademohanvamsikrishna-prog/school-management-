# API Reference

Base URL: `http://localhost:8000/api/v1`

All endpoints (except `/health` and `POST /auth/login`) require:
```
Authorization: Bearer <access_token>
```

## Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | Login, returns access + refresh token | No |
| GET | `/auth/me` | Current user + permissions | Yes |
| POST | `/auth/refresh` | Exchange refresh token for new access token | No (uses refresh token) |

## Admin (requires `users:manage` or `classes:manage`)

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/admin/users` | users:read |
| POST | `/admin/users` | users:manage |
| PATCH | `/admin/users/{id}` | users:manage |
| DELETE | `/admin/users/{id}` | users:manage |
| GET | `/admin/roles` | users:read |
| GET | `/admin/classes` | classes:read |
| POST | `/admin/classes` | classes:manage |
| PATCH | `/admin/classes/{id}` | classes:manage |
| DELETE | `/admin/classes/{id}` | classes:manage |
| GET | `/admin/subjects` | subjects:read |
| POST | `/admin/subjects` | subjects:manage |
| POST | `/admin/enrollments` | classes:manage |
| GET | `/admin/classes/{id}/students` | classes:read |

## Timetable

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/timetable/class/{class_id}` | timetable:read |
| GET | `/timetable/teacher/{teacher_id}` | timetable:read |
| POST | `/timetable` | timetable:manage (conflict detection included) |
| DELETE | `/timetable/{id}` | timetable:manage |

## Attendance

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/attendance/summary/{student_id}` | attendance:read |
| GET | `/attendance/records/{student_id}` | attendance:read |
| GET | `/attendance/student/{id}/history` | attendance:read |
| POST | `/attendance/mark` | attendance:mark |

## Marks + Exams

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/marks/exams` | marks:read |
| POST | `/marks/exams` | marks:write |
| PATCH | `/marks/exams/{id}/status` | marks:write |
| GET | `/marks/student/{id}` | marks:read |
| POST | `/marks/enter` | marks:write |

## Finance (Simulated Payments)

> ⚠️ All payment processing is SANDBOX/SIMULATED only.

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/finance/student/{id}/invoices` | finance:read |
| POST | `/finance/pay/simulate` | finance:pay_mock |

## Events + Notifications

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/events` | any authenticated |
| POST | `/events` | events:manage |
| PATCH | `/events/{id}` | events:manage |
| DELETE | `/events/{id}` | events:manage |
| GET | `/notifications/me` | any authenticated |
| POST | `/notifications/{id}/read` | any authenticated |

## Profile + Dashboard

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/profile/me` | any authenticated |
| GET | `/dashboard/summary` | any authenticated |

## Chat (REST Polling)

> Not real-time. Clients should poll `/messages` for updates.

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/chat/conversations` | chat:participate |
| POST | `/chat/conversations` | chat:participate |
| GET | `/chat/conversations/{id}` | chat:participate |
| GET | `/chat/conversations/{id}/messages` | chat:participate |
| POST | `/chat/conversations/{id}/messages` | chat:participate |

## Food Court

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/food/menu` | any authenticated |
| POST | `/food/orders` | any authenticated |
| GET | `/food/orders/mine` | any authenticated |
| PATCH | `/food/orders/{id}/status` | events:manage |

## Transport

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/transport/routes` | any authenticated |
| GET | `/transport/routes/{id}/stops` | any authenticated |
| GET | `/transport/my-assignment` | any authenticated |

## Library

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/library/books` | any authenticated |
| GET | `/library/issues/mine` | any authenticated |
| POST | `/library/issues` | events:manage |
| POST | `/library/issues/{id}/return` | events:manage |

## Leave + Timesheet

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/leave/types` | any authenticated |
| POST | `/leave/requests` | any authenticated |
| GET | `/leave/requests/mine` | any authenticated |
| PATCH | `/leave/requests/{id}/approve` | users:manage |
| PATCH | `/leave/requests/{id}/reject` | users:manage |

## Hostel

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/hostel/hostels` | any authenticated |
| GET | `/hostel/hostels/{id}/rooms` | any authenticated |
| GET | `/hostel/my-allocation` | any authenticated |

## Inventory

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/inventory/items` | users:manage |
| POST | `/inventory/items/{id}/movement` | users:manage |

## HR + Performance

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/hr/departments` | any authenticated |
| GET | `/hr/performance/mine` | any authenticated |
| POST | `/hr/performance` | users:manage |

## Analytics

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/analytics/overview` | users:read |
| GET | `/analytics/attendance/class/{id}` | attendance:read |

## System

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/health` | No |
| GET | `/` | No |
