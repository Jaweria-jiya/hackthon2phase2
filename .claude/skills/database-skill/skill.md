---
name: database-skill
description: Design and manage robust database systems including table creation, migrations, and scalable schema design.
---

# Database Design & Management (Database-Skill)

## Instructions

1. **Schema Design**
   - Identify entities and relationships
   - Normalize data (avoid duplication)
   - Define primary keys and foreign keys
   - Choose appropriate data types

2. **Table Creation**
   - Create tables with clear naming conventions
   - Apply constraints (NOT NULL, UNIQUE)
   - Add indexes for frequently queried columns
   - Enforce referential integrity

3. **Migrations**
   - Use versioned migrations
   - Separate up and down migrations
   - Never edit old migrations
   - Test migrations on staging before production

4. **Data Integrity & Performance**
   - Use transactions for critical operations
   - Apply cascading rules carefully
   - Optimize queries with indexes
   - Avoid over-indexing

## Best Practices
- Use snake_case or camelCase consistently
- Keep schemas simple and readable
- Prefer UUIDs or auto-increment IDs consistently
- Document schema changes
- Design for future scalability

## Example Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
