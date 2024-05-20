# 12. Use a new role to feature flag new Out of Service Beds functionality

Date: 2024-05-16

## Status

Tentative

## Context

- We need to be able to feature flag [the 'out of service beds' functionality](./0013-refer-to-lost-beds-as-out-of-service-beds-in-future-features.md) whilst it is under development
- We will need to test this in preprod and dev but we won't want it to be in production until it is approved by stakeholders
- We already use roles to control which user groups can see which features

## Decision

We will add a new role to enable the Out of Service Beds functionality for specified users

## Consequences

- We could enable the role only in the API and not show it in the User Management UI
- We could show it to all users in the User Management UI
- We could add a feature switch to only allow the option to give users the role in the User Management UI in dev and preprod only
- We will be able to have more granular control over who sees the new functionality than an on/off flag would allow
- We could test in prod for users who have the role set
