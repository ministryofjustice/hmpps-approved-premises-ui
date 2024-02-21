import { defineConfig } from 'cypress'
import { resetStubs } from './integration_tests/mockApis/setup'
import auth from './integration_tests/mockApis/auth'
import tokenVerification from './integration_tests/mockApis/tokenVerification'
import premises from './integration_tests/mockApis/premises'
import booking from './integration_tests/mockApis/booking'
import bookingExtension from './integration_tests/mockApis/bookingExtension'
import arrival from './integration_tests/mockApis/arrival'
import nonArrival from './integration_tests/mockApis/nonArrival'
import departure from './integration_tests/mockApis/departure'
import cancellation from './integration_tests/mockApis/cancellation'
import lostBed from './integration_tests/mockApis/lostBed'
import person from './integration_tests/mockApis/person'
import reports from './integration_tests/mockApis/reports'
import applications from './integration_tests/mockApis/applications'
import { stubJourney } from './integration_tests/mockApis/journeyUtils'
import assessments from './integration_tests/mockApis/assessments'
import users from './integration_tests/mockApis/users'
import tasks from './integration_tests/mockApis/tasks'
import placementRequests from './integration_tests/mockApis/placementRequests'
import placementApplication from './integration_tests/mockApis/placementApplication'
import bedSearch from './integration_tests/mockApis/beds'
import moveBooking from './integration_tests/mockApis/moveBooking'

export default defineConfig({
  chromeWebSecurity: false,
  fixturesFolder: 'integration_tests/fixtures',
  screenshotsFolder: 'integration_tests/screenshots',
  trashAssetsBeforeRuns: true,
  downloadsFolder: 'integration_tests/downloads',
  videosFolder: 'integration_tests/videos',
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  taskTimeout: 70000,
  e2e: {
    setupNodeEvents(on) {
      on('task', {
        reset: resetStubs,
        ...arrival,
        ...nonArrival,
        ...auth,
        ...tokenVerification,
        ...premises,
        ...booking,
        ...bookingExtension,
        ...departure,
        ...cancellation,
        ...lostBed,
        ...person,
        ...applications,
        ...assessments,
        ...users,
        ...tasks,
        ...placementRequests,
        ...placementApplication,
        ...bedSearch,
        ...moveBooking,
        ...reports,
        stubJourney,
      })
    },
    baseUrl: 'http://localhost:3007',
    excludeSpecPattern: '**/!(*.cy).ts',
    specPattern: 'integration_tests/tests/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'integration_tests/support/index.ts',
  },
})
