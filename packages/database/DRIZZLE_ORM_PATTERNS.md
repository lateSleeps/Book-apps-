# Drizzle ORM Usage Patterns

Quick examples of common Drizzle ORM queries for the Rara Beauty database.

## Basic Setup

```typescript
import { db } from "@rara/database/lib/db";
import {
  salons,
  users,
  services,
  bookings,
  type Salon,
  type Booking,
  eq,
  and,
  or,
  lt,
  gt,
  desc,
} from "@rara/database";
```

## READ Queries

### Get Single Record

```typescript
// Find salon by slug
const salon = await db.query.salons.findFirst({
  where: (s, { eq }) => eq(s.slug, "rara-beauty-main"),
});
```

### Get Multiple Records

```typescript
// Get all active services for a salon
const services = await db.query.services.findMany({
  where: (s, { eq, and }) => and(eq(s.salonId, salonId), eq(s.isActive, true)),
  orderBy: (s) => s.sortOrder,
});
```

### Load Related Data (Relationships)

```typescript
// Get booking with all details
const booking = await db.query.bookings.findFirst({
  where: (b, { eq }) => eq(b.id, bookingId),
  with: {
    service: {
      with: { category: true }, // Nested relations
    },
    stylist: {
      with: { user: true },
    },
    salon: true,
  },
});

// Access: booking.service.category.name
```

### Filter with Multiple Conditions

```typescript
// Get available stylists for a specific date
const availableStylists = await db.query.stylists.findMany({
  where: (st, { and, eq }) =>
    and(eq(st.salonId, salonId), eq(st.isActive, true)),
  with: {
    schedules: {
      where: (sch, { eq }) => eq(sch.dayOfWeek, dayOfWeek),
    },
  },
});
```

### Pagination

```typescript
const pageSize = 10;
const pageNumber = 1;
const offset = (pageNumber - 1) * pageSize;

const bookings = await db.query.bookings.findMany({
  where: (b, { eq }) => eq(b.salonId, salonId),
  limit: pageSize,
  offset,
  orderBy: (b) => b.createdAt,
});
```

## CREATE Operations

### Insert Single Record

```typescript
import { v4 as uuidv4 } from "uuid";

const newService = await db
  .insert(services)
  .values({
    id: uuidv4(),
    salonId,
    categoryId,
    name: "Premium Hair Cut",
    price: 150000, // in cents
    duration: 60, // in minutes
    isActive: true,
  })
  .returning();

console.log(newService[0]); // Get inserted record
```

### Insert Multiple Records

```typescript
const newServices = await db
  .insert(services)
  .values([
    {
      id: uuidv4(),
      salonId,
      categoryId,
      name: "Service 1",
      price: 100000,
      duration: 60,
    },
    {
      id: uuidv4(),
      salonId,
      categoryId,
      name: "Service 2",
      price: 150000,
      duration: 90,
    },
  ])
  .returning();
```

## UPDATE Operations

### Update Single Record

```typescript
await db
  .update(bookings)
  .set({
    status: "confirmed",
    updatedAt: new Date(),
  })
  .where(eq(bookings.id, bookingId));
```

### Update Multiple Records

```typescript
// Mark all old bookings as completed
await db
  .update(bookings)
  .set({ status: "completed" })
  .where((b, { lt }) => lt(b.bookingDate, "2026-05-20"));
```

### Conditional Update with JSONB

```typescript
// Update salon settings
await db
  .update(salons)
  .set({
    settings: {
      timezone: "Asia/Jakarta",
      maxAdvanceBookingDays: 60,
      breakStartTime: "12:00",
      breakEndTime: "13:00",
    },
  })
  .where(eq(salons.id, salonId));
```

## DELETE Operations (Soft Delete Pattern)

```typescript
// Instead of hard delete, set isActive to false
await db
  .update(services)
  .set({ isActive: false })
  .where(eq(services.id, serviceId));

// When querying, filter out inactive records
where: (s, { and, eq }) =>
  and(
    eq(s.salonId, salonId),
    eq(s.isActive, true), // Only active
  );
```

## Complex Queries

### Check Booking Conflicts

```typescript
// Find overlapping bookings for a stylist
const conflicts = await db.query.bookings.findMany({
  where: (b, { and, eq, sql }) =>
    and(
      eq(b.stylistId, stylistId),
      eq(b.bookingDate, bookingDate),
      sql`${b.startTime} < ${newEndTime} AND ${b.endTime} > ${newStartTime}`,
    ),
});

const hasConflict = conflicts.length > 0;
```

### Join Multiple Tables

```typescript
// Get customer's booking history with services
const customerHistory = await db.query.bookings.findMany({
  where: (b, { eq }) => eq(b.customerId, customerId),
  with: {
    service: {
      with: { category: true },
    },
    stylist: {
      with: { user: true },
    },
    salon: true,
  },
  orderBy: (b) => [b.bookingDate, b.startTime],
});
```

### Aggregate/Count

```typescript
// Count total bookings for a salon
const result = await db
  .select({ count: sql`count(*)` })
  .from(bookings)
  .where(eq(bookings.salonId, salonId));

const totalBookings = result[0].count;
```

## Type Safety

### Define Request/Response Types

```typescript
import type {
  Booking,
  InsertBooking,
  User,
  Service,
  UserRole,
  BookingStatus,
} from "@rara/database";

// Function with type-safe parameters
async function createBooking(booking: InsertBooking): Promise<Booking> {
  const result = await db.insert(bookings).values(booking).returning();
  return result[0];
}

// Function with typed enums
function handleBookingStatus(status: BookingStatus): string {
  switch (status) {
    case "pending":
      return "Awaiting confirmation";
    case "confirmed":
      return "Confirmed";
    case "completed":
      return "Service provided";
    case "cancelled":
      return "Cancelled by customer";
    case "no_show":
      return "Customer did not attend";
  }
}
```

## Error Handling

```typescript
import { db } from "@rara/database";

try {
  const booking = await db
    .insert(bookings)
    .values({
      /* ... */
    })
    .returning();
} catch (error) {
  // Check PostgreSQL error codes
  if (error.code === "23505") {
    // UNIQUE constraint violation
    throw new Error("Booking code already exists");
  } else if (error.code === "23503") {
    // FOREIGN KEY violation
    throw new Error("Stylist or service not found");
  } else if (error.code === "23514") {
    // CHECK constraint violation
    throw new Error("Invalid price or duration");
  }
  throw error;
}
```

## Raw SQL (When Needed)

```typescript
import { sql } from "drizzle-orm";

// Complex query that's hard to express with ORM
const result = await db.execute(sql`
  SELECT 
    s.id, s.name,
    COUNT(b.id) as total_bookings,
    AVG(r.rating) as avg_rating
  FROM services s
  LEFT JOIN bookings b ON s.id = b.service_id
  LEFT JOIN reviews r ON b.id = r.booking_id
  WHERE s.salon_id = ${salonId}
  GROUP BY s.id, s.name
  ORDER BY total_bookings DESC
`);
```

## Performance Tips

✅ **Do this:**

- Use `with` to eagerly load relations
- Filter at DB level, not in JavaScript
- Paginate large result sets
- Use indexes (already configured)
- Cache frequently accessed data

❌ **Avoid this:**

- Loading all bookings without date filter
- Filtering with JavaScript loops
- N+1 queries (load parent, then loop children)
- Hard deletes (use soft delete pattern)

## Drizzle Studio

Explore data visually:

```bash
pnpm db:studio
# Opens http://localhost:3000
```

## Resources

- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- Schema: [DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)
- Quick Reference: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
