# 11. Don't store application data in the session

Date: 2023-04-27

## Status

Accepted

## Context

When filling out an application in Apply, when a page is updated, we store the
application in the session and save it to the API. This has a number of
downsides:

- Applications are large objects. Given the fact that we're using Redis to persist the application, we risk filling up our Redis instance with session data.
- If a session expires during an application, we risk information not being current, or something unexpected breaking.
- We currently don't store Assessments in the session during the assessment process, so it makes sense to be consistent.

## Decision

We will no longer save application data to the session, instead preferring to
submit and read directly from the API.

## Consequences

This will keep our Redis storage down, as well as continue to be consistent
with the approach for Assess. This will make integration testing harder, as
there are a number of pages in an application. We will lean on
[Wiremock scenarios](https://wiremock.org/docs/stateful-behaviour/) to make
this possible.
