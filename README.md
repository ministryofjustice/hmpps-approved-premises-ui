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

In order to spin up a full stack of a working API and other dependent services use [AP Tools](https://github.com/ministryofjustice/hmpps-approved-premises-tools).

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

You will need to have the following **environment variables** in your local `.env` file.

NOTIFY_API_KEY will need updating (speak to colleagues). All other defaults should work out of the box.

```
API_CLIENT_ID=approved-premises-ui
APPROVED_PREMISES_API_URL=http://localhost:8080
CAS1_E2E_ADMINISTRATOR_PASSWORD=secret
CAS1_E2E_ADMINISTRATOR_USERNAME=JIMSNOWLDAP
CAS1_E2E_ASSESSOR_EMAIL=jim.snow@justice.gov.uk
CAS1_E2E_ASSESSOR_NAME="Test Jim Snow"
CAS1_E2E_ASSESSOR_PASSWORD=secret
CAS1_E2E_ASSESSOR_USERNAME=JIMSNOWLDAP
CAS1_E2E_CRU_MEMBER_PASSWORD=secret
CAS1_E2E_CRU_MEMBER_USERNAME=LAOFULLACCESS
CAS1_E2E_DELIUS_USERNAME_TO_ADD_AND_DELETE=john-smith
CAS1_E2E_EMERGENCY_ASSESSOR_NAME_TO_ALLOCATE_TO="Test Jim Snow"
CAS1_E2E_FUTURE_MANAGER_PASSWORD=secret
CAS1_E2E_FUTURE_MANAGER_USERNAME=LAOFULLACCESS
CAS1_E2E_PERSON_FOR_ADHOC_BOOKING_CRN=X320811
CAS1_E2E_REPORT_VIEWER_PASSWORD=secret
CAS1_E2E_REPORT_VIEWER_USERNAME=JIMSNOWLDAP
CAS1_E2E_USER_WITHOUT_ROLES_PASSWORD=secret
CAS1_E2E_USER_WITHOUT_ROLES_USERNAME=JIMSNOWLDAP
CAS1_E2E_CHECK_EMAILS=false
HMPPS_AUTH_EXTERNAL_URL=http://localhost:9091/auth
HMPPS_AUTH_NAME=AP_USER TEST_1
HMPPS_AUTH_PASSWORD=*REDACTED*
HMPPS_AUTH_URL=http://localhost:9091/auth
HMPPS_AUTH_USERNAME=AP_USER_TEST_1
NOTIFY_API_KEY=*REDACTED*
SYSTEM_CLIENT_ID=approved-premises-api
ENABLE_V2_MATCH=true
```

#### Testing Email Locally

When testing locally emails will not be enabled by default. To enable this behaviour:

1. Update .env, changing:

```
CAS1_E2E_CHECK_EMAILS=true
NOTIFY_API_KEY=set to the local-e2e test key (speak to collegues)
```

2. In the api project, update application-local.yml, adding the following:

```
notify:
  mode: TEST_AND_GUEST_LIST
  api-key: aforementioned NOTIFY_API_KEY value
  guest-list-api-key: aforementioned NOTIFY_API_KEY value
```

#### Running locally but using upstream dev services (emulate tests that run in 'dev')

Start ap-tools as follows:

```shell
docker compose down --clear-databases
ap-tools server start --local-ui --local-api-dev-upstream
```

Use this in .env

```shell
API_CLIENT_ID=approved-premises-ui
APPROVED_PREMISES_API_URL=http://localhost:8080
CAS1_E2E_ADMINISTRATOR_PASSWORD=doesntmatter
CAS1_E2E_ADMINISTRATOR_USERNAME=AP_USER_TEST_2
CAS1_E2E_ASSESSOR_EMAIL=stuart.harrison2+test1@digital.justice.gov.uk
CAS1_E2E_ASSESSOR_NAME=AP_USER TEST_1
CAS1_E2E_ASSESSOR_PASSWORD=doesntmatter
CAS1_E2E_ASSESSOR_USERNAME=AP_USER_TEST_1
CAS1_E2E_CRU_MEMBER_PASSWORD=doesntmatter
CAS1_E2E_CRU_MEMBER_USERNAME=AP_USER_TEST_4
CAS1_E2E_DELIUS_USERNAME_TO_ADD_AND_DELETE=JOSEPHHOLLINSHEAD
CAS1_E2E_EMERGENCY_ASSESSOR_NAME_TO_ALLOCATE_TO=AP_USER TEST_1
CAS1_E2E_FUTURE_MANAGER_PASSWORD=doesntmatter
CAS1_E2E_FUTURE_MANAGER_USERNAME=AP_USER_TEST_4
CAS1_E2E_PERSON_FOR_ADHOC_BOOKING_CRN=X349420
CAS1_E2E_REPORT_VIEWER_PASSWORD=doesntmatter
CAS1_E2E_REPORT_VIEWER_USERNAME=AP_USER_TEST_2
CAS1_E2E_USER_WITHOUT_ROLES_PASSWORD=doesntmatter
CAS1_E2E_USER_WITHOUT_ROLES_USERNAME=AP_USER_TEST_1
CAS1_E2E_CHECK_EMAILS=false
HMPPS_AUTH_EXTERNAL_URL=http://localhost:9091/auth
HMPPS_AUTH_NAME=AP_USER TEST_1
HMPPS_AUTH_PASSWORD=*REDACTED*
HMPPS_AUTH_URL=http://localhost:9091/auth
HMPPS_AUTH_USERNAME=AP_USER_TEST_1
SYSTEM_CLIENT_ID=approved-premises-api
ENABLE_V2_MATCH=true
```

Then start using one of

```
npx playwright test --config ./e2e/playwright.config.ts  --project=local-dev-upstream
npx playwright test --config ./e2e/playwright.config.ts  --project=local-dev-upstream --ui
```

#### CLI commands

Headless:

```bash
npm run test:e2e:local
# -> npx playwright test --config ./e2e/playwright.config.ts --project=local
```

With UI:

```bash
npm run test:e2e:local:ui
# -> npx playwright test --config ./e2e/playwright.config.ts --project=local --ui
```

When running with UI it may select 'setupLocal' project by default. Click on projects and select 'local' too to see all tests

## Feature flags

We currently use environment variables for feature flags.

## Updating API Schema Types

The following script can be used to update the local type models (defined in server/@types). These are pulled from the approved-premises open-api definitions on the main branch 

```
/script/generate-types
```

There is also a github workflow that will automatically generate PRs to update the local model whenever the API open api definition is changed.

Once the script has been ran, manual updates may be required to the factories defined in testutils/factories to add any new fields