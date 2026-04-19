# Analysis: Denormalization vs Integration Events

## Denormalization (e.g., Customer Name in Jobs table)
**When to use:**
- When the data is almost static and rarely changes (e.g., a customer's name at the time of job creation).
- When read performance is critical and joins across modules/schemas would be too expensive or complex.
- When the "point-in-time" state is important (e.g., "What was the customer's name when this job was created?").

**Consistency Trade-offs:**
- **Strong consistency at write time:** We store the data once.
- **Data staleness:** If the source data (Customer name) changes in the `Contacts` module, the `Jobs` module will have stale data unless updated.
- **Storage overhead:** Duplicate data across tables.

## Integration Events (Syncing across bounded contexts)
**When to use:**
- When bounded contexts must remain loosely coupled and own their own data.
- When the downstream module needs to perform complex logic based on the update (e.g., re-calculating statistics or sending notifications).
- When "eventual consistency" is acceptable for the business requirements.

**Consistency Trade-offs:**
- **Eventual consistency:** There will be a delay between the change in the source module and the update in the destination module.
- **Complexity:** Requires a reliable messaging infrastructure (Outbox, message queue).
- **Resilience:** If one module is down, the system remains operational, and the update will be processed once the module is back online.

## Conclusion
For **JobTracker**, we use **integration events** to trigger actions like invoice generation because it decouples the `Jobs` module from the `Billing` module. However, for simple display purposes in the UI, some **denormalization** of basic customer info (like name) might be acceptable to avoid cross-module joins during job listing.
