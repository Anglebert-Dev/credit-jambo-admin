Modules and new endpoints to add

Admin Auth

Note: no registration; enforce admin role


Admin Users
GET /api/admin/users (filters: role, status, email; pagination: page, limit; sorting: sortBy, order)
GET /api/admin/users/:id
PATCH /api/admin/users/:id/status (body: status)
DELETE /api/admin/users/:id (soft delete)
Admin Credits
GET /api/admin/credits (filters: status; pagination: page, limit; sorting)
GET /api/admin/credits/:id
PATCH /api/admin/credits/:id/approve
PATCH /api/admin/credits/:id/reject (body: reason)
Admin Analytics (logins and devices from refreshToken table)
GET /api/admin/analytics/overview
totals: users, active users, total credit requests, pending credits, total savings
login stats: total logins, active devices
GET /api/admin/analytics/logins (filters: from, to; pagination)
GET /api/admin/analytics/devices (filters: userId; pagination)
Cross-cutting
Admin router namespace: /api/admin/*
requireAdmin middleware on all admin routes
Swagger docs for all new admin endpoints