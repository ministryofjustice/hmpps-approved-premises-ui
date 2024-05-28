# 15. Use a 'manage' namespace to distinguish new functionality

Date: 2024-05-24

## Status

Tentative

## Context

- We will be building out some new functionality to manage Approved Premises
- There is lots of existing manage functionality (a full list of paths is [here](../../server/paths/manage.ts')).
- We need to be able to draw a clear line between the new functionality and the existing functionality in order to avoid making unintended changes to the existing functionality.

## Decision

We will use prefix all of the URLs for the new functionality with `/manage`

## Consequences

- It will be clearer which pages are part of the new development
