import { ApprovedPremisesUser as User } from '../../@types/shared'

export const userSummaryListItems = (user: User) => [
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
      text: user?.email ?? 'No email address available',
    },
  },
  {
    key: {
      text: 'Phone number',
    },
    value: {
      text: user?.telephoneNumber ?? 'No phone number available',
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
]
