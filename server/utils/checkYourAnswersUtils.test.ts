import { Task } from '@approved-premises/ui'
import applicationFactory from '../testutils/factories/application'
import paths from '../paths/apply'
import Apply from '../form-pages/apply'

import { checkYourAnswersSections, embeddedSummaryListItem } from './checkYourAnswersUtils'

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

Apply.pages['basic-information'] = {
  first: FirstPage,
  second: SecondPage,
}

describe('applicationUtils', () => {
  describe('embeddedSummaryListItem', () => {
    it('returns a summary list for an array of records', () => {
      const result = embeddedSummaryListItem([
        { foo: 'bar', bar: 'baz' },
        { foo: 'bar', bar: 'baz' },
      ]).replace(/\s+/g, ``)

      expect(result).toEqual(
        `
      <dl class="govuk-summary-list govuk-summary-list--embedded">
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            foo
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            bar
          </dd>
        </div>
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            bar
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            baz
          </dd>
        </div>
      </dl>

      <dl class="govuk-summary-list govuk-summary-list--embedded">
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            foo
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            bar
          </dd>
        </div>
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            bar
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            baz
          </dd>
        </div>
      </dl>`.replace(/\s+/g, ``),
      )
    })
  })

  describe('checkYourAnswersSections', () => {
    it('returns the check your answers sections for an application', () => {
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
              title: 'Basic Information',
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

    it('returns an embeded summary list if the response is an array of objects', () => {
      FirstPage.mockReturnValue({
        response: () => {
          return {
            foo: [
              { foo: 'bar', bar: 'baz' },
              { foo: 'bar', bar: 'baz' },
            ],
          }
        },
      })

      SecondPage.mockReturnValue({
        response: () => {
          return { bar: 'foo' }
        },
      })

      const application = applicationFactory.build()
      application.data = { 'basic-information': { first: '', second: '' } }

      expect(checkYourAnswersSections(application)).toEqual([
        {
          title: 'First',
          tasks: [
            {
              id: 'basic-information',
              title: 'Basic Information',
              rows: [
                {
                  key: { text: 'foo' },
                  value: {
                    html: embeddedSummaryListItem([
                      { foo: 'bar', bar: 'baz' },
                      { foo: 'bar', bar: 'baz' },
                    ]),
                  },
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
