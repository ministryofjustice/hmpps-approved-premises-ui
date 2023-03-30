# 10. Use Playwright for End-to-End tests

Date: 2023-03-30

## Status

Accepted

## Context

We have a suite of end-to-end tests in this repository that use [Cypress](https://www.cypress.io/) to
test the application after deployment. However, recently, they have begun to
cause us a lot of issues, with flaky performance, slowness and issues with
`cypress-cucumber-preprocessor` using different Typescript settings to the
main project, amongst other things.

In <./0009-use-contract-tests-in-favour-of-e2e-tests.md> we attempted to get around
this by using contract tests instead of e2e tests. However, we have since discovered
that the contract tests don't quite cover everything we expected, so, for the sake
of confidence, we would like to keep using a suite of e2e tests somewhere.

## Decision

We are going to trial using a suite of end to end tests in a different repo using
[Playwright](https://playwright.dev/). This is a more lightweight alternative to
Cypress, which is in use in other parts of HMPPS (See <https://github.com/ministryofjustice/hmpps-probation-integration-e2e-tests>).

These tests will be run in the `e2e_environment_test` CircleCI pipeline on the
development environment, after the environment has deployed.

We will deliberately keep the tests focused, as more of a smoke test to ensure
the application runs as expected, rather than reusing integration test code which
is more robust and has a lot of expectations.

We will keep an eye on these tests and how they go, because there is a balance
between us having a consistently passing test suite (which may suggest our
happy path is too "happy") and a test suite that breaks a lot, but for legitimate
reasons (i.e. a change in the UI or API that breaks functionality).

## Consequences

This will mean we're maintaining two test suites, one for integration and one for
end to end tests, however:

- The end to end tests will be kept deliberately simplistic, only testing the "happy path", with minimal expectations
- We will be able to use the VSCode [Playwright Test plugin](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright), which will allow us to "record" any new/changed tests - meaning we can rapidly generate / iterate end to end tests

The current "shared" page objects are more in-depth than is required for our end-to-end
tests, and have a lot of conditionals depending on what context they're running in -
no longer sharing page objects means we can simplify our integration test suites.

The issues we were having with `cypress-cucumber-preprocessor` will go away and we
can have one Typescript config across the whole project.
