import { userDetailsFactory } from '../testutils/factories'
import { sectionsForUser } from './userUtils'
import { navigationItems } from './navigationItems'

jest.mock('./userUtils')

const sections = [
  {
    id: 'foo',
    title: 'Foo Title',
    description: 'Foo Description',
    shortTitle: 'Foo',
    href: '/foo',
  },
  {
    id: 'bar',
    title: 'Bar Title',
    description: 'Bar Description',
    shortTitle: 'Bar',
    href: '/bar',
  },
]

describe('navigationItems', () => {
  it('should map sections to navigation items', () => {
    ;(sectionsForUser as jest.Mock).mockReturnValue(sections)
    const user = userDetailsFactory.build()

    expect(navigationItems(user, '/foo/bar/baz')).toEqual([
      {
        text: 'Home',
        href: '/',
        active: false,
      },
      {
        text: 'Foo',
        href: '/foo',
        active: true,
      },
      {
        text: 'Bar',
        href: '/bar',
        active: false,
      },
    ])
  })
})
