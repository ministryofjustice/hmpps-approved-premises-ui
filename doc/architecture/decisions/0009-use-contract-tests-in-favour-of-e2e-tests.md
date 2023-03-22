# 9. Use Contract tests in favour of E2E tests

Date: 2023-03-21

## Status

Accepted

## Context

To make sure the frontend application keeps up to date with any changes in the
API, we have, to date, used Cypress to run end to end tests after the application
has deployed to dev. This has a number of drawbacks:

- We have to maintain integration and e2e tests, which are functionally similar, but different enough for there to be differences in implementation
- We have to wait for a new version of the code to be deployed before running our e2e tests, meaning the feedback look for noticing a problem and fixing it is long
- e2e tests are slow running, slowing down our build pipeline
- As the tests run in a real environment, we are filling the database with test data, which has to be cleaned out
- The tests can be flaky, as pass for reasons that are outside our control, such as upstream APIs being down, or performance issues
- When tests do fail, it's not always clear _what_ has broken, and it can be hard to track down the source of the failure

The e2e tests also have not kept up with the functionality in the application, only
covering a minority of services (so far, Apply and some of Manage).

## Decision

With all this in mind, we've decided to use [Pact](https://pact.io/) to carry out
Contract Testing when testing our API client classes.

When running Pact contract tests, JSON files called "Pacts" are generated. The
usual approach is to use these files to drive the API development. However, we
have a well worn path of using OpenAPI in the API project (see <https://github.com/ministryofjustice/hmpps-approved-premises-api/blob/main/doc/architecture/decisions/0003-use-open-api-generator-to-scaffold-controllers-from-open-api-file.md>),
so we have decided to use [Swagger Mock Validator](https://bitbucket.org/atlassian/swagger-mock-validator/src/master/)
after each contract test to ensure the generated Pact matches the current OpenAPI
spec.

Running the validator after each test suite will cause a failing test with
information about how the generated Pact and the OpenAPI spec differ.

As we won't use these Pact files to drive our development, we will ensure the
tests generate them in a temporary directory.

## Consequences

This will hopefully speed up our development, and raise any deviation in the
contract between the API and the UI applications in a timely manner without the
need for expensive and flaky E2E tests. When API changes do cause the tests to
fail, it will be easier to diagnose the cause and deploy a fix. We will also be
able to remove our E2E tests from the repo (to be documented in a future ADR).

One drawback is that major changes to the API will cause the build to break, and
may slow down development, as we won't be able to ignore these changes as we
could with E2E tests. However this will reduce the risk of bad code making its
way into production, especially as the project moves closer to live.
