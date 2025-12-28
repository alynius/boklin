# Boklin Documentation Index

Welcome! This directory contains comprehensive documentation about the Boklin codebase patterns and utilities. Here's how to navigate:

## Documentation Files

### 1. Start Here
- **[RESEARCH_SUMMARY.md](./RESEARCH_SUMMARY.md)** - Quick overview of the entire codebase
  - Project structure
  - Tech stack
  - Key patterns summary
  - Common implementation patterns
  - Limitations and next steps
  - Recommended reading order

### 2. Quick Reference (During Development)
- **[PATTERNS_QUICK_REFERENCE.md](./PATTERNS_QUICK_REFERENCE.md)** - Fast lookup guide
  - Copy-paste code snippets
  - Common mistakes to avoid
  - File locations
  - Best used while coding

### 3. In-Depth Guide (For Learning)
- **[PATTERNS_AND_UTILITIES.md](./PATTERNS_AND_UTILITIES.md)** - Comprehensive documentation
  - 1244 lines of detailed patterns
  - Full code examples
  - Explanations and rationales
  - Complete API reference
  - Best used when learning new patterns

## By Topic

### Authentication
- See: [PATTERNS_AND_UTILITIES.md - Section 1](./PATTERNS_AND_UTILITIES.md#1-authentication-patterns)
- Quick: [PATTERNS_QUICK_REFERENCE.md - Authentication](./PATTERNS_QUICK_REFERENCE.md#authentication)

### Forms & Validation
- See: [PATTERNS_AND_UTILITIES.md - Section 3](./PATTERNS_AND_UTILITIES.md#3-form-patterns)
- Quick: [PATTERNS_QUICK_REFERENCE.md - Forms & Validation](./PATTERNS_QUICK_REFERENCE.md#forms--validation)

### Components
- See: [PATTERNS_AND_UTILITIES.md - Section 4](./PATTERNS_AND_UTILITIES.md#4-component-patterns)
- Quick: [PATTERNS_QUICK_REFERENCE.md - Components](./PATTERNS_QUICK_REFERENCE.md#components)

### Styling & Design
- See: [PATTERNS_AND_UTILITIES.md - Section 6](./PATTERNS_AND_UTILITIES.md#6-styling-patterns)
- Quick: [PATTERNS_QUICK_REFERENCE.md - Styling](./PATTERNS_QUICK_REFERENCE.md#styling)

### Database
- See: [PATTERNS_AND_UTILITIES.md - Section 2](./PATTERNS_AND_UTILITIES.md#2-data-fetching-patterns)
- Quick: [PATTERNS_QUICK_REFERENCE.md - Database](./PATTERNS_QUICK_REFERENCE.md#database)

### Routing
- See: [PATTERNS_AND_UTILITIES.md - Section 5](./PATTERNS_AND_UTILITIES.md#5-routing-patterns)
- Quick: [PATTERNS_QUICK_REFERENCE.md - Routing](./PATTERNS_QUICK_REFERENCE.md#routing)

### Utilities & Types
- See: [PATTERNS_AND_UTILITIES.md - Section 7](./PATTERNS_AND_UTILITIES.md#7-reusable-utilities)
- Quick: [PATTERNS_QUICK_REFERENCE.md - Utilities](./PATTERNS_QUICK_REFERENCE.md#utilities)

## Typical Usage Scenarios

### "I'm implementing a new feature"
1. Check [PATTERNS_QUICK_REFERENCE.md](./PATTERNS_QUICK_REFERENCE.md)
2. Look at similar existing code
3. Refer to [PATTERNS_AND_UTILITIES.md](./PATTERNS_AND_UTILITIES.md) for details

### "I need to understand how X works"
1. Find X in [RESEARCH_SUMMARY.md](./RESEARCH_SUMMARY.md)
2. Read detailed section in [PATTERNS_AND_UTILITIES.md](./PATTERNS_AND_UTILITIES.md)
3. Look at code examples in `/src/`

### "I'm creating a new component"
1. Check [Component Patterns in Quick Reference](./PATTERNS_QUICK_REFERENCE.md#components)
2. Review [Section 4 of Full Guide](./PATTERNS_AND_UTILITIES.md#4-component-patterns)
3. Look at existing components in `/src/components/ui/`

### "I need to add authentication"
1. Read [Authentication section in Quick Reference](./PATTERNS_QUICK_REFERENCE.md#authentication)
2. Check [Detailed Auth Patterns](./PATTERNS_AND_UTILITIES.md#1-authentication-patterns)
3. See `/src/lib/auth/index.ts` and `/src/middleware.ts`

### "I'm creating a form"
1. Check [Forms section in Quick Reference](./PATTERNS_QUICK_REFERENCE.md#forms--validation)
2. Review [Form Patterns in Full Guide](./PATTERNS_AND_UTILITIES.md#3-form-patterns)
3. Look at `/src/components/booking/booking-form.tsx` as example

## File Structure Reference

Core files you'll work with:
```
/home/youhad/boklin/
├── CLAUDE.md                              # Project instructions
├── RESEARCH_SUMMARY.md                    # This overview
├── PATTERNS_QUICK_REFERENCE.md           # Quick lookup
├── PATTERNS_AND_UTILITIES.md             # Comprehensive guide
├── DOCUMENTATION_INDEX.md                # This file
│
└── src/
    ├── lib/
    │   ├── auth/index.ts                 # Auth configuration
    │   ├── db/schema.ts                  # Database schema
    │   ├── db/index.ts                   # DB instance
    │   ├── utils.ts                      # Helper functions
    │   ├── i18n/sv.ts                    # Swedish translations
    │   └── validations/                  # Zod schemas
    ├── components/
    │   ├── ui/                           # Base components
    │   ├── booking/                      # Booking components
    │   └── dashboard/                    # Dashboard components
    ├── types/index.ts                    # Type definitions
    ├── middleware.ts                     # Route protection
    └── app/
        ├── (auth)/                       # Auth pages
        ├── (dashboard)/                  # Protected pages
        ├── (marketing)/                  # Public pages
        └── [username]/                   # Booking pages
```

## Key Concepts

### Design System
The "Nordic Linen" design system with warm, neutral colors and consistent spacing.
See: [Styling Patterns - Section 6](./PATTERNS_AND_UTILITIES.md#6-styling-patterns)

### Route Organization
Uses Next.js route groups `(name)` for logical organization without URL slugs.
See: [Routing Patterns - Section 5](./PATTERNS_AND_UTILITIES.md#5-routing-patterns)

### Component Composition
Card, Button, Input components are composable with sub-components.
See: [Component Patterns - Section 4](./PATTERNS_AND_UTILITIES.md#4-component-patterns)

### Validation
All forms use Zod schemas with Swedish error messages.
See: [Form Patterns - Section 3](./PATTERNS_AND_UTILITIES.md#3-form-patterns)

### Authentication
Uses NextAuth.js v5 with Google OAuth and middleware-based route protection.
See: [Authentication Patterns - Section 1](./PATTERNS_AND_UTILITIES.md#1-authentication-patterns)

## Common Tasks Checklist

- [ ] Adding a protected route? See [Protected Routes Pattern](./PATTERNS_QUICK_REFERENCE.md#routing)
- [ ] Creating a form? See [Form Patterns](./PATTERNS_AND_UTILITIES.md#3-form-patterns)
- [ ] Adding a component? See [Component Structure](./PATTERNS_AND_UTILITIES.md#41-ui-component-structure)
- [ ] Styling something? Use [Design Tokens](./PATTERNS_AND_UTILITIES.md#61-design-token-colors)
- [ ] Database query? See [Database Patterns](./PATTERNS_AND_UTILITIES.md#2-data-fetching-patterns)
- [ ] Swedish text? Check [Translations](./PATTERNS_AND_UTILITIES.md#72-swedish-translations)

## Additional Resources

- **Project Instructions**: See [CLAUDE.md](./CLAUDE.md)
- **Source Code**: See `/src/` directory
- **Examples**: Look at existing pages and components as reference implementations

## Quick Links

- [Button component](./PATTERNS_AND_UTILITIES.md#button-component)
- [Input component](./PATTERNS_AND_UTILITIES.md#form-error-display)
- [Card component](./PATTERNS_AND_UTILITIES.md#42-card-component-pattern)
- [cn() utility](./PATTERNS_AND_UTILITIES.md#43-using-cn-utility)
- [formatDate/Time](./PATTERNS_AND_UTILITIES.md#71-utils-module)
- [Swedish translations](./PATTERNS_AND_UTILITIES.md#72-swedish-translations)
- [Type definitions](./PATTERNS_AND_UTILITIES.md#73-type-definitions)
- [Database schema](./PATTERNS_AND_UTILITIES.md#74-database-schema-patterns)
- [Validation schemas](./PATTERNS_AND_UTILITIES.md#75-validation-schemas-pattern)

## Legend

- **Server Component**: Async component in Next.js App Router
- **Client Component**: Component with "use client" directive
- **Route Group**: Directory with `(name)` - doesn't affect URL
- **Dynamic Route**: Path segment like `[username]` or `[id]`
- **Zod**: TypeScript-first schema validation library
- **Drizzle**: TypeScript ORM for PostgreSQL

## Questions?

1. Check relevant section in [PATTERNS_AND_UTILITIES.md](./PATTERNS_AND_UTILITIES.md)
2. Look for similar code in `/src/` as examples
3. Review existing implementations for patterns
4. Check [PATTERNS_QUICK_REFERENCE.md](./PATTERNS_QUICK_REFERENCE.md) for code snippets

---

Generated: December 28, 2025
Last Updated: Documentation v1.0
