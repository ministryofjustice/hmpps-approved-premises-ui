import { signIn } from './signIn'

context('Redirects', () => {
  beforeEach(() => {
    cy.task('reset')
    signIn([])
  })

  const redirects = [
    ['/premises', '/manage/premises'],
    ['/premises/:premisesId', '/manage/premises/:premisesId'],
    ['/premises/:premisesId/beds', '/manage/premises/:premisesId/beds'],
    ['/premises/:premisesId/beds/:bedId', '/manage/premises/:premisesId/beds/:bedId'],
    ['/premises/:premisesId/lost-beds', '/manage/premises/:premisesId/out-of-service-beds/current'],
    [
      '/premises/:premisesId/beds/:bedId/lost-beds/:id',
      '/manage/premises/:premisesId/beds/:bedId/out-of-service-beds/:id/details',
    ],
    [
      '/premises/:premisesId/beds/:bedId/lost-beds/new',
      '/manage/premises/:premisesId/beds/:bedId/out-of-service-beds/new',
    ],
    [
      '/premises/:premisesId/bookings/:bookingId/date-changes/new',
      '/manage/premises/:premisesId/bookings/:bookingId/date-changes/new',
    ],
  ]

  redirects.forEach(([from, to]) => {
    it(`redirects from ${from} to ${to}`, () => {
      cy.visit(from, { failOnStatusCode: false })

      cy.location('pathname').should('eq', to)
    })
  })
})
