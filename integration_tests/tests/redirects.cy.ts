import { faker } from '@faker-js/faker/locale/en_GB'
import { signIn } from './signIn'

context('Redirects', () => {
  beforeEach(() => {
    cy.task('reset')

    // Given I am signed in as an applicant
    signIn('applicant')
  })

  const premisesId: string = faker.string.uuid()
  const placementId: string = faker.string.uuid()
  const bedId: string = faker.string.uuid()
  const id: string = faker.string.uuid()

  const redirects = [
    ['/premises', '/manage/premises'],
    [`/premises/${premisesId}`, `/manage/premises/${premisesId}`],
    [`/premises/${premisesId}/beds`, `/manage/premises/${premisesId}/beds`],
    [`/premises/${premisesId}/beds/${bedId}`, `/manage/premises/${premisesId}/beds/${bedId}`],
    [`/premises/${premisesId}/lost-beds`, `/manage/premises/${premisesId}/out-of-service-beds/current`],
    [
      `/premises/${premisesId}/beds/${bedId}/lost-beds/${id}`,
      `/manage/premises/${premisesId}/beds/${bedId}/out-of-service-beds/${id}/details`,
    ],
    [
      `/premises/${premisesId}/beds/${bedId}/lost-beds/new`,
      `/manage/premises/${premisesId}/beds/${bedId}/out-of-service-beds/new`,
    ],
    [`/premises/${premisesId}/bookings/${placementId}`, `/manage/premises/${premisesId}/placements/${placementId}`],
    [
      `/manage/premises/${premisesId}/bookings/${placementId}`,
      `/manage/premises/${premisesId}/placements/${placementId}`,
    ],
  ]

  redirects.forEach(([from, to]) => {
    it(`redirects from ${from} to ${to}`, () => {
      cy.visit(from, { failOnStatusCode: false })

      cy.location('pathname').should('eq', to)
    })
  })
})
