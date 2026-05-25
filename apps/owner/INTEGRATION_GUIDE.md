# Owner Dashboard ↔ Customer Booking App Integration Guide

## Overview

The owner dashboard and customer booking app are now integrated using **shared mock data**. Settings configured in the owner dashboard directly control what displays in the customer booking app.

**Status**: Temporary mock data integration (for development). Full API integration coming in v2.0.

---

## How It Works

### Data Flow

```
Owner Dashboard                 Customer Booking App
─────────────────────────────────────────────────────
Settings UI                     Mock Data Hook
    ↓                                 ↓
salon-shared-mock.ts ←→ isActive flags control visibility
    ↓                                 ↓
Service/Category/Stylist/       Only active items display
Product with isActive=true/false to customers
```

### Key Features

1. **Single Source of Truth**: `salon-shared-mock.ts` contains all salon settings
2. **Granular Control**: Toggle `isActive` flags to show/hide services, products, and stylists
3. **Automatic Filtering**: Customer app automatically filters by `isActive` status
4. **Zero Configuration**: No additional setup needed—changes propagate automatically

---

## Files Involved

### Owner App

| File | Purpose |
|------|---------|
| `src/features/dashboard/mocks/salon-shared-mock.ts` | **Central data store** - Categories, Services (50), Stylists, Products with `isActive` flags |
| `src/features/dashboard/components/settings/UsersAndRolesSection.tsx` | User & role management UI |
| `src/features/dashboard/components/settings/RolePermissionMatrix.tsx` | Permission matrix display |

### Customer App

| File | Purpose |
|------|---------|
| `src/features/booking/hooks/use-mock-data.ts` | **Reads and filters** salon data - only shows active items |
| All category/service/product pages | Use filtered data from `useMockData()` hook |

---

## Data Structure

### Services with `isActive` Flag

```typescript
{
  id: 'svc-1',
  categoryId: 'cat-1',
  serviceFlow: 'STYLING_HAIR',
  name: 'Ladies Haircut + Wash',
  description: '...',
  price: 180_000,
  duration: 45,
  isActive: true  // ← Controls visibility
}
```

### How to Deactivate a Service

In `salon-shared-mock.ts`, find the service and toggle `isActive`:

```typescript
// Mark Balayage as unavailable
{ id: 'svc-12', categoryId: 'cat-2', name: 'Balayage', ..., isActive: false },
```

**Result**: Balayage will no longer appear in customer booking app.

---

## What Changes

### When You Toggle `isActive = false`

**Owner App Behavior**:
- Service still visible in settings (but marked as inactive)
- Owner can re-activate anytime

**Customer App Behavior**:
- Service removed from category listings
- Category hidden if no active services remain
- Customers cannot book this service
- Instant update (no cache, no reload needed)

### Currently Inactive Services

These services are set to `isActive: false`:

- **svc-12**: Balayage (needs specialist, under maintenance)
- **svc-16**: Keratin Hair Treatment (temporarily unavailable)
- **svc-30**: Volume Lash Extensions (no stylist available)
- **svc-36**: Stone Massage (equipment maintenance)

**Note**: These match the `UNAVAILABLE_SERVICE_IDS` set from the original mock data.

---

## Implementation Details

### Filtering Logic in Customer App

```typescript
// 1. All services with isActive flag
const ALL_SERVICES = [
  { id: 'svc-1', ..., isActive: true },
  { id: 'svc-12', ..., isActive: false },  // Hidden
  ...
];

// 2. Filter by isActive
const SERVICES = ALL_SERVICES.filter(s => s.isActive);

// 3. Return only active services
export function useMockData() {
  return {
    services: SERVICES,  // Only active
    categories: CATEGORIES,  // Only if they have active services
    stylists: STYLISTS,  // Only active
    products: PRODUCTS,  // Only active
    ...
  };
}
```

### Helper Functions (for future owner UI)

In `salon-shared-mock.ts`:

```typescript
// Toggle service status (for future UI)
toggleServiceActive(serviceId: string)

// Get only active items
getActiveServices()
getActiveCategories()
getActiveStylists()
getActiveProducts()

// Get services by category
getServicesByCategory(categoryId, activeOnly = true)
```

---

## Integration Timeline

### Current (v1.0 - Mock Data)
- ✅ Shared mock data created
- ✅ Customer app filters by `isActive`
- ✅ Manual toggle of `isActive` flags
- ⏳ Owner UI to toggle (coming soon)

### Future (v2.0 - API Integration)
- API backend stores salon settings in database
- Both apps fetch from live API
- Real-time sync via API
- No need to manually update mock data

---

## How to Use This Integration

### For Development

1. **Modify a service**: Edit `salon-shared-mock.ts`
2. **Toggle visibility**: Change `isActive: true/false`
3. **Test in customer app**: Service appears/disappears automatically
4. **Commit changes**: Git tracks the mock data version

### For Production (Future)

1. Owner uses dashboard to toggle services
2. API endpoint updates database
3. Customer app fetches updated settings
4. Real-time visibility changes

---

## Testing

### Test Scenario: Disable a Service

1. Open `src/features/dashboard/mocks/salon-shared-mock.ts`
2. Find service: `{ id: 'svc-1', name: 'Ladies Haircut + Wash', ..., isActive: true }`
3. Change to: `isActive: false`
4. Open customer app's category page
5. **Expected**: Service no longer appears in the list

### Test Scenario: Remove a Category

1. If a category has no active services, it automatically hides
2. Make all services in "Hair" category inactive
3. **Expected**: Hair category disappears from customer app

---

## Notes & Gotchas

### ⚠️ Important

- **isActive is the source of truth** - If a service is `isActive: true` but has no stylist, it will still show (future: add staffing validation)
- **Categories filter dynamically** - Categories with zero active services are auto-hidden
- **This is temporary** - Once API is ready, migrate data to database and remove mock files

### Future Improvements

1. **Owner Dashboard UI**: Add toggles to activate/deactivate services without editing code
2. **Scheduling Integration**: Services show availability based on stylist schedules
3. **Inventory Tracking**: Products track stock before showing in customer app
4. **Real-time Sync**: Websocket updates when owner changes settings
5. **Backup & Restore**: Version control for salon settings

---

## Related Documentation

- [Owner Dashboard Role System](./src/features/auth/README.md)
- [Customer App Booking Flow](../rara-booking/BOOKING_FLOW.md)
- [API Integration Plan](./API_INTEGRATION.md)

---

## Questions?

For questions about the integration, refer to:
- `salon-shared-mock.ts` - Schema and data structure
- `use-mock-data.ts` - How customer app filters data
- This document - Integration overview

---

**Last Updated**: May 24, 2026
**Status**: Active Development (v1.0 Mock Data)
