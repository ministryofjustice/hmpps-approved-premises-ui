import { userSummaryListItems } from '.'
import { userFactory } from '../../testutils/factories'

describe('UserUtils', () => {
  it('returns the correct objects in an array when all the expected data is present', () => {
    const user = userFactory.build()

    expect(userSummaryListItems(user)).toEqual([
      {
        key: {
          text: 'Name',
        },
        value: {
          text: user.name,
        },
      },
      {
        key: {
          text: 'Username',
        },
        value: {
          text: user.deliusUsername,
        },
      },
      {
        key: {
          text: 'Email',
        },
        value: {
          text: user.email,
        },
      },
      {
        key: {
          text: 'Phone number',
        },
        value: {
          text: user.telephoneNumber,
        },
      },
      {
        key: {
          text: 'Region',
        },
        value: {
          text: user.region.name,
        },
      },
    ])
  })

  it('returns the correct objects in an array when all the email and phone number is missing', () => {
    const user = userFactory.build({ email: undefined, telephoneNumber: undefined })

    expect(userSummaryListItems(user)).toEqual([
      {
        key: {
          text: 'Name',
        },
        value: {
          text: user.name,
        },
      },
      {
        key: {
          text: 'Username',
        },
        value: {
          text: user.deliusUsername,
        },
      },
      {
        key: {
          text: 'Email',
        },
        value: {
          text: 'No email address available',
        },
      },
      {
        key: {
          text: 'Phone number',
        },
        value: {
          text: 'No phone number available',
        },
      },
      {
        key: {
          text: 'Region',
        },
        value: {
          text: user.region.name,
        },
      },
    ])
  })
})
