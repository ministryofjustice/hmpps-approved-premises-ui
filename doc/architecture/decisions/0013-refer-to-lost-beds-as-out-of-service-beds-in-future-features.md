# 13. Refer to 'lost beds' as 'out of service beds' in future features

Date: 2024-05-16

## Status

Accepted

## Context

- We will soon iterate on the 'Manage' transaction of the service.
- The North East (NE) AP area are currently the only area using this transaction.
- We need to retain 'Manage' features and ensure their stability whilst rapidly developing overlapping functionality.
- The most critical feature is currently referred to as 'lost beds'.
- Users are more familiar with the term 'out of service beds'.

## Decision

We will call the features intended to replace the 'lost beds' functionality 'out of service beds'.

## Consequences

- We will be able to build the new functionality without the changes polluting the existing code enabling us to iterate quickly.
- The different terminology ("lost beds" versus "out-of-service beds") should help incoming developers differentiate between the new code and the functionality which is being replaced.
- The terminology will be closer to what the users use aiding clarity.
