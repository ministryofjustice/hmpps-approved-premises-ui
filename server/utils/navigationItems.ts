import { UserDetails } from '@approved-premises/ui'

import { sectionsForUser } from './userUtils'

export const navigationItems = (user: UserDetails, currentPath: string) => {
  const sections = sectionsForUser(user)

  return [
    {
      text: 'Home',
      href: '/',
      active: false,
    },
    ...sections.map(section => {
      return {
        text: section.shortTitle,
        href: section.href,
        active: currentPath.startsWith(section.href),
      }
    }),
  ]
}
