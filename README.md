# Approved Premises

Apply for and manage approved premises

## Prerequisites

- Docker
- NodeJS (version specified in .node-version file)

## Setup

When running the application for the first time, run the following command:

```bash
script/setup
```

This will tear down and setup the application, create .env files and bootstrap the application.

If you're coming back to the application after a certain amount of time, you can run:

```bash
script/bootstrap
```

## Running the application

### Using AP Tools

In order to spin up a full stack of a working API and other [dependent services](./docker-compose.yml) we recommend using [AP Tools](https://github.com/ministryofjustice/hmpps-approved-premises-tools).

NB. The approach AP Tools takes solves a critical limitation for working in
development. Due to how the frontend and API authenticate requests they both
require access to _the same_ instance of hmpps-auth. This project is the focus
of our development tooling across all CAS services and is most likely to receive
future updates.

After following the set up the common commands are:

```bash
ap-tools server start --local-ui --local-api
```

```bash
ap-tools server stop
```

The service should then be available at <http://localhost:3000>

[Log in credentials are documented within AP
tools](https://github.com/ministryofjustice/hmpps-approved-premises-tools#start-server).

## Release process

Our release process aligns with the other CAS teams and as such [lives in
Confluence](https://dsdmoj.atlassian.net/wiki/spaces/AP/pages/4247847062/Release+process).
The steps are also available in the
[PULL_REQUEST_TEMPLATE](/.github/PULL_REQUEST_TEMPLATE.md#release-checklist).

## Manage infrastructure & view logs

This application is hosted on the MoJ Cloud Platform. For further details
head over to [our infrastructure documentation](/doc/how-to/manage-infrastructure.md).

## E2E tests

Install Playwright:

```bash
npm install
npx playwright install
```

### Running locally against the deployed `dev` environment

#### Environment variables

You will need to have the following **environment variables** in your local `.env` file:

```
API_CLIENT_ID=approved-premises-ui
APPROVED_PREMISES_API_URL=http://localhost:8080
CAS1_E2E_ADMINISTRATOR_PASSWORD=*REDACTED*
CAS1_E2E_ADMINISTRATOR_USERNAME=AP_USER_TEST_2
CAS1_E2E_ASSESSOR_EMAIL=e2e.test.user@example.digital.justice.gov.uk
CAS1_E2E_ASSESSOR_NAME="AP_USER TEST_1"
CAS1_E2E_ASSESSOR_PASSWORD=*REDACTED*
CAS1_E2E_ASSESSOR_USERNAME=AP_USER_TEST_1
CAS1_E2E_CRU_MEMBER_PASSWORD=*REDACTED*
CAS1_E2E_CRU_MEMBER_USERNAME=AP_USER_TEST_4
CAS1_E2E_DELIUS_USERNAME_TO_ADD_AND_DELETE=JOSEPHHOLLINSHEAD
CAS1_E2E_EMERGENCY_ASSESSOR_NAME_TO_ALLOCATE_TO="AP_USER TEST_1"
CAS1_E2E_EMERGENCY_NAME_TO_ALLOCATE_TO="AP_USER TEST_1"
CAS1_E2E_FUTURE_MANAGER_PASSWORD=*REDACTED*
CAS1_E2E_FUTURE_MANAGER_USERNAME=AP_USER_TEST_5
CAS1_E2E_LEGACY_MANAGER_PASSWORD=*REDACTED*
CAS1_E2E_LEGACY_MANAGER_USERNAME=AP_USER_TEST_3
CAS1_E2E_PERSON_FOR_ADHOC_BOOKING_CRN=X349420
CAS1_E2E_REPORT_VIEWER_PASSWORD=*REDACTED*
CAS1_E2E_REPORT_VIEWER_USERNAME=AP_USER_TEST_2
CAS1_E2E_USER_WITHOUT_ROLES_PASSWORD=*REDACTED*
CAS1_E2E_USER_WITHOUT_ROLES_USERNAME=AP_USER_TEST_1
HMPPS_AUTH_EXTERNAL_URL=http://localhost:9091/auth
HMPPS_AUTH_NAME="AP_USER TEST_1"
HMPPS_AUTH_PASSWORD=*REDACTED*
HMPPS_AUTH_URL=http://localhost:9091/auth
HMPPS_AUTH_USERNAME=AP_USER_TEST_1
NOTIFY_API_KEY=*REDACTED*
SYSTEM_CLIENT_ID=approved-premises-api
```

To run headless:

```bash
npm run test:e2e:ci
# ->  npx playwright test --config ./e2e/playwright.config.ts  --project=dev
```

or with the UI:

```bash
npm run test:e2e:ui
# ->  npx playwright test --config ./e2e/playwright.config.ts  --project=dev --ui

```

### Running locally against your `local` development environment

#### Environment variables

You will need to have the following **environment variables** in your local `.env` file:

```
API_CLIENT_ID=approved-premises-ui
APPROVED_PREMISES_API_URL=http://localhost:8080
CAS1_E2E_ADMINISTRATOR_PASSWORD=secret
CAS1_E2E_ADMINISTRATOR_USERNAME=JIMSNOWLDAP
CAS1_E2E_ASSESSOR_EMAIL=jim.snow@example.digital.justice.gov.uk
CAS1_E2E_ASSESSOR_NAME="JIM SNOW"
CAS1_E2E_ASSESSOR_PASSWORD=secret
CAS1_E2E_ASSESSOR_USERNAME=JIMSNOWLDAP
CAS1_E2E_CRU_MEMBER_PASSWORD=secret
CAS1_E2E_CRU_MEMBER_USERNAME=SHEILAHANCOCKNPS
CAS1_E2E_DELIUS_USERNAME_TO_ADD_AND_DELETE=BERNARD.BEAKS
CAS1_E2E_EMERGENCY_ASSESSOR_NAME_TO_ALLOCATE_TO="JIM SNOW"
CAS1_E2E_FUTURE_MANAGER_PASSWORD=*REDACTED*
CAS1_E2E_FUTURE_MANAGER_USERNAME=APPROVEDPREMISESTESTUSER
CAS1_E2E_LEGACY_MANAGER_PASSWORD=secret
CAS1_E2E_LEGACY_MANAGER_PASSWORD=secret
CAS1_E2E_LEGACY_MANAGER_USERNAME=JIMSNOWLDAP
CAS1_E2E_LEGACY_MANAGER_USERNAME=JIMSNOWLDAP
CAS1_E2E_PERSON_FOR_ADHOC_BOOKING_CRN=X320811
CAS1_E2E_REPORT_VIEWER_PASSWORD=secret
CAS1_E2E_REPORT_VIEWER_USERNAME=JIMSNOWLDAP
CAS1_E2E_USER_WITHOUT_ROLES_PASSWORD=secret
CAS1_E2E_USER_WITHOUT_ROLES_USERNAME=JIMSNOWLDAP
HMPPS_AUTH_EXTERNAL_URL=http://localhost:9091/auth
HMPPS_AUTH_NAME=AP_USER TEST_1
HMPPS_AUTH_PASSWORD=*REDACTED*
HMPPS_AUTH_URL=http://localhost:9091/auth
HMPPS_AUTH_USERNAME=AP_USER_TEST_1
NOTIFY_API_KEY=*REDACTED*
SYSTEM_CLIENT_ID=approved-premises-api
```

#### CLI commands

Headless:

```bash
test:e2e:local
# -> npx playwright test --config ./e2e/playwright.config.ts --project=local
```

With UI:

```bash
test:e2e:local:ui
# -> npx playwright test --config ./e2e/playwright.config.ts --project=local --ui
```

## Feature flags

We use [Flipt](http://flipt.io) for feature flags. See https://github.com/ministryofjustice/hmpps-approved-premises-ui/blob/main/doc/how-to/add-a-feature-flag.md
for more details
