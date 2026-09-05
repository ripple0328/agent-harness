# Feature: Example Item

**Status:** ready
**Parent:** example
**Last Updated:** 2026-01-01

## Context

This sample feature demonstrates how acceptance criteria, tests, and QA evidence
trace together without depending on a real product domain.

Users can create a named example item, invalid names are rejected, and one user
cannot access another user's item.

## Acceptance Criteria

- [ ] **AC1 - Create named item.** Given a signed-in user with valid input, when
  they create an example item, then the item is stored and appears in their list.
  (risk: medium)
- [ ] **AC2 - Reject empty names.** Given a signed-in user, when they submit an
  empty item name, then the UI blocks submission and explains the error.
  (risk: low)
- [ ] **AC3 - Enforce ownership.** Given two signed-in users, when one user tries
  to load another user's item, then access is denied. (risk: high)

## Out Of Scope

- Sharing items between users.
- Bulk item operations.

## Test Specification

### Test Objectives

- Prove users can create a named item.
- Prove invalid names are blocked.
- Prove users cannot access another user's item.

### Functional Test Cases

| ID | Criterion | Layer | Scenario | Expected Result |
|---|---|---|---|---|
| TC1 | AC1 | integration | Create valid item | Record is persisted for the user |
| TC2 | AC2 | UI | Submit empty name | Submission blocked with error |
| TC3 | AC3 | integration/e2e | Load another user's item | Access denied |
