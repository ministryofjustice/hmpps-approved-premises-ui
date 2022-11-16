import { Task } from '@approved-premises/ui'
import applicationFactory from '../testutils/factories/application'
import paths from '../paths/apply'
import { pages } from '../form-pages/apply'

import { checkYourAnswersSections } from './checkYourAnswersUtils'

const FirstPage = jest.fn()
const SecondPage = jest.fn()

jest.mock('../form-pages/apply', () => {
  return {
    pages: { 'basic-information': {}, 'type-of-ap': {} },
    sections: [
      {
        title: 'First',
        tasks: [
          {
            id: 'basic-information',
            title: 'Basic Information',
            pages: { 'basic-information': {}, 'type-of-ap': {} },
          },
        ] as Array<Task>,
      },
      {
        title: 'Second',
        tasks: [] as Array<Task>,
      },
    ],
  }
})

pages['basic-information'] = {
  first: FirstPage,
  second: SecondPage,
}

describe('applicationUtils', () => {
  describe('checkYourAnswersSections', () => {
    it('removes the last section from the section list', () => {
      FirstPage.mockReturnValue({
        response: () => {
          return { foo: 'bar' }
        },
      })

      SecondPage.mockReturnValue({
        response: () => {
          return { bar: 'foo' }
        },
      })

      const application = applicationFactory.build()
      application.data = { 'basic-information': { first: '', second: '' }, 'type-of-ap': {} }

      expect(checkYourAnswersSections(application)).toEqual([
        {
          title: 'First',
          tasks: [
            {
              id: 'basic-information',
              rows: [
                {
                  key: { text: 'foo' },
                  value: { text: 'bar' },
                  actions: {
                    items: [
                      {
                        href: paths.applications.pages.show({
                          task: 'basic-information',
                          page: 'first',
                          id: application.id,
                        }),
                        text: 'Change',
                        visuallyHiddenText: 'foo',
                      },
                    ],
                  },
                },
                {
                  key: { text: 'bar' },
                  value: { text: 'foo' },
                  actions: {
                    items: [
                      {
                        href: paths.applications.pages.show({
                          task: 'basic-information',
                          page: 'second',
                          id: application.id,
                        }),
                        text: 'Change',
                        visuallyHiddenText: 'bar',
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ])
    })
  })
})
