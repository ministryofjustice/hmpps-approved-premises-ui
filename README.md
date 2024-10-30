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

### Running against UI/API hosted in the `dev` environment

Copy the contents of `.env.dev` into `.env`. Update the user passwords to the actual values (available in 1Password)

If you also want to test emails, review the 'Testing Emails' section below

Then start the tests using one of the following:

```
# headless
npm run test:e2e:ci
# ui
npm run test:e2e:ui
```

### Running against UI/API hosted in your local dev environment (ap-tools)

First start the ap-tools using

```
ap-tools server stop --clear-databases
ap-tools server start --local-ui --local-api
```

Copy the contents of `.env.local` into `.env`

If you also want to test emails, review the 'Testing Emails' section below

Then start the tests using one of the following:

```
npm run test:e2e:local
npm run test:e2e:local:ui
```

#### Running against UI/API hosted in your local dev environment against upstream services in dev (emulate circle ci e2e test execution)

First start the ap-tools using

```
ap-tools server stop --clear-databases
ap-tools server start --local-ui --local-api-dev-upstream
```

Copy the contents of `.env.local-dev-upstream` into `.env`

If you also want to test emails, review the 'Testing Emails' section below

Then start the tests using one of the following:

```
npm run test:e2e:local-dev-upstream
npm run test:e2e:local-dev-upstream:ui
```

### Testing Emails

The E2E test do not check emails by default. To enable this in the e2e tests update the .env file, changing:

```
CAS1_E2E_CHECK_EMAILS=true
NOTIFY_API_KEY=set to the local-e2e test key (speak to collegues)
```

If then API is also running locally, that will need configuring to send emails to notify:

```
notify:
  mode: TEST_AND_GUEST_LIST
  api-key: aforementioned NOTIFY_API_KEY value
  guest-list-api-key: aforementioned NOTIFY_API_KEY value
```

## Feature flags

We currently use environment variables for feature flags.

## Updating API Schema Types

The following script can be used to update the local type models (defined in server/@types). These are pulled from the approved-premises open-api definitions on the main branch 

```
/script/generate-types
```

There is also a github workflow that will automatically generate PRs to update the local model whenever the API open api definition is changed.

Once the script has been ran, manual updates may be required to the factories defined in testutils/factories to add any new fields