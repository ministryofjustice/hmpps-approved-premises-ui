# Approved Premises

Apply for and manage approved premises

## Prerequisites

- Docker
- NodeJS (version specified in .node-version file)

## Setup

When running the application for the first time, run the [generate-dotenv-files.sh](script/generate-dotenv-files.sh) script by executing this command from root in a Terminal:
```
./script/generate-dotenv-files.sh
```

Running the above script will generate two `.env` files required by the application:
* [.env](.env) - this is blank initially but is required for the application to deploy as we use `dotenv` as an `npm` lib in this repo. This blank file will also enable you to override properties set in the `.env.cas1-ui` file in `AP tools` where we deploy the application (see the `Running the application` section below for more details on this)
* [e2e.env](e2e.env) - this is used to load properties for the `Playwright` e2e suite (see the `E2E tests` section below for more details on this)

## Running the application

### Using AP Tools

In order to spin up a full local stack with the API (integrating with dependent services) use [AP Tools](https://github.com/ministryofjustice/hmpps-approved-premises-tools).

NB. This project is the focus of our development tooling across all CAS services and is likely to receive future updates.

After following the setup the common commands are:

* When running the API as a docker container and deploying everything (inc. this UI):
```
 ap-tools server start --cas1 --local-ui
```

* When running the API locally and deploying everything (inc. this UI):
```
 ap-tools server start --cas1 --local-ui --local-api
```

The service should then be available at <http://localhost:3000>

The same credentials used to login to the dev instance of the CAS1 UI should be used. For more information, see the [Dev & Test Users documentation](https://dsdmoj.atlassian.net/wiki/spaces/AP/pages/5624791477/Dev+Test+Users)

For a quick glance at the user logins see the [e2e.env](e2e.env) file (see the `E2E tests` section below for more details on this file)

* To stop the deployment:
```
ap-tools server stop
```

## Release process

Our release process aligns with the other CAS teams and as such [lives in
Confluence](https://dsdmoj.atlassian.net/wiki/spaces/AP/pages/4247847062/Release+process).
The steps are also available in the
[PULL_REQUEST_TEMPLATE](/.github/PULL_REQUEST_TEMPLATE.md#release-checklist).

## Manage infrastructure & view logs

This application is hosted on the MoJ Cloud Platform. For further details
head over to [our infrastructure documentation](/doc/how-to/manage-infrastructure.md).

## E2E tests
The [generate-dotenv-files.sh](script/generate-dotenv-files.sh) script run in the `Setup` section earlier generated a [e2e.env](e2e.env) by:
* copying from the [e2e.env.template](e2e.env.template) file 
* swapping out the parameterized values in the template for real `Kubernetes` secrets for you. For more information, see the [Dev & Test Users documentation](https://dsdmoj.atlassian.net/wiki/spaces/AP/pages/5624791477/Dev+Test+Users)
* this [e2e.env](e2e.env) loads all of the property values required by the `Playwright` e2e suite

### Installation steps
* Install Playwright:

```bash
npm install
npx playwright install
```

### Running against UI/API hosted in your local dev environment (ap-tools)

First start the ap-tools using

```
ap-tools server stop --clear-databases
ap-tools server start --cas1 --local-ui --local-api
```

If you also want to test emails, review the 'Testing Emails' section below

Then start the tests using one of the following:

```
npm run test:e2e:local
npm run test:e2e:local:ui
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