# Async Processing in JobTracker

## Domain Events vs. Integration Events
- **Domain Events:** Used for communication **WITHIN** the same module/bounded context. They are typically handled synchronously or via the outbox to maintain consistency within the module. They represent something that happened in the domain (e.g., `JobCompletedDomainEvent`).
- **Integration Events:** Used for communication **ACROSS** different modules or bounded contexts (e.g., from `Jobs` to `Billing`). They are part of the module's public contract and are always processed asynchronously to ensure loose coupling.

## Outbox Pattern
The Outbox pattern ensures **at-least-once delivery** of events. By saving the events in the same transaction as the domain state changes, we guarantee that if the database update succeeds, the events are also persisted. A background processor (Hangfire) then polls these events and dispatches them. This prevents data loss if the message broker or the event handler is temporarily unavailable.

## Idempotency
Idempotency is guaranteed in the handlers (e.g., Invoice generation) by using an **idempotency key**. In this system, we can use a combination of `JobId` and `CompletedAt` (or a unique `IntegrationEventId`) to ensure that processing the same event multiple times does not result in duplicate side effects (like generating two invoices for the same job).
