import { Request } from 'express'
import { DeepMocked, createMock } from '@golevelup/ts-jest'
import 'reflect-metadata'

// Use a wildcard import to allow us to use jest.spyOn on functions within this module
import { TaskNames } from '@approved-premises/ui'
import * as utils from './index'
import TasklistPage, { TasklistPageInterface } from '../tasklistPage'
import { ApprovedPremisesApplication } from '../../@types/shared'

import { applicationFactory } from '../../testutils/factories'

describe('utils', () => {
  describe('applyYesOrNo', () => {
    it('returns a keypair of a yes/no answer and details', () => {
      const body = { foo: 'yes', fooDetail: 'Some Detail', something: 'else' }

      expect(utils.applyYesOrNo('foo', body)).toEqual({ foo: 'yes', fooDetail: 'Some Detail' })
    })

    it('accepts a generic', () => {
      const body = { foo: 'yes', fooDetail: 'Some Detail', something: 'else' }

      expect(utils.applyYesOrNo<'foo' | 'bar'>('foo', body)).toEqual({ foo: 'yes', fooDetail: 'Some Detail' })
    })
  })

  describe('yesOrNoResponseWithDetail', () => {
    it('returns a response with detail if the answer is yes', () => {
      const body = { foo: 'yes', fooDetail: 'Some Detail' }

      expect(utils.yesOrNoResponseWithDetailForYes('foo', body)).toEqual('Yes - Some Detail')
    })

    it('returns no detail if the answer is no', () => {
      const body = { foo: 'no' }

      expect(utils.yesOrNoResponseWithDetailForYes('foo', body)).toEqual('No')
    })
  })

  describe('yesNoOrDontKnowResponseWithDetail', () => {
    it('returns a response with detail if the answer is yes', () => {
      const body = { foo: 'yes', fooDetail: 'Some Detail' }

      expect(utils.yesNoOrDontKnowResponseWithDetail('foo', body)).toEqual('Yes - Some Detail')
    })

    it('returns No if the answer is no', () => {
      const body = { foo: 'no' }

      expect(utils.yesNoOrDontKnowResponseWithDetail('foo', body)).toEqual('No')
    })

    it("returns Don't know if the answer is iDontKnow", () => {
      const body = { foo: 'iDontKnow' }

      expect(utils.yesNoOrDontKnowResponseWithDetail('foo', body)).toEqual("Don't know")
    })
  })

  describe('Decorator metadata utils', () => {
    class Section {}

    class Task {}

    class Page1 {}
    class Page2 {}

    beforeEach(() => {
      Reflect.defineMetadata('page:name', 'page-1', Page1)
      Reflect.defineMetadata('page:name', 'page-2', Page2)

      Reflect.defineMetadata('page:task', 'task-1', Page1)
      Reflect.defineMetadata('page:task', 'task-2', Page2)

      Reflect.defineMetadata('task:slug', 'slug', Task)
      Reflect.defineMetadata('task:name', 'Name', Task)
      Reflect.defineMetadata('task:pages', [Page1, Page2], Task)

      Reflect.defineMetadata('section:title', 'Section', Section)
      Reflect.defineMetadata('section:tasks', [Task], Section)
    })

    describe('getTask', () => {
      it('fetches metadata for a specific task and pages', () => {
        expect(utils.getTask(Task as unknown as Record<string, unknown>)).toEqual({
          id: 'slug',
          title: 'Name',
          pages: { 'page-1': Page1, 'page-2': Page2 },
        })
      })
    })

    describe('getSection', () => {
      it('fetches metadata for a specific section and tasks', () => {
        expect(utils.getSection(Section as unknown as Record<string, unknown>)).toEqual({
          title: 'Section',
          tasks: [utils.getTask(Task as unknown as Record<string, unknown>)],
        })
      })
    })

    describe('getPagesForSections', () => {
      it('fetches pages for all supplied sections', () => {
        class Section1 {}
        class Section2 {}

        jest.spyOn(utils, 'getSection').mockImplementation((section: Section1 | Section2) => {
          if (section === Section1) {
            return {
              title: 'Section 1',
              name: 'Section1',
              tasks: [{ id: 'foo' as TaskNames, title: 'Foo', pages: { 'page-1': Page1, 'page-2': Page2 } }],
            }
          }
          return {
            title: 'Section 2',
            name: 'Section2',
            tasks: [{ id: 'bar' as TaskNames, title: 'Bar', pages: { 'page-3': Page1, 'page-4': Page2 } }],
          }
        })

        expect(
          utils.getPagesForSections([
            Section1 as unknown as Record<string, unknown>,
            Section2 as unknown as Record<string, unknown>,
          ]),
        ).toEqual({
          foo: {
            'page-1': Page1,
            'page-2': Page2,
          },
          bar: {
            'page-3': Page1,
            'page-4': Page2,
          },
        })
      })
    })

    describe('viewPath', () => {
      it('returns the view path for a page', () => {
        const page1 = new Page1()
        const page2 = new Page2()

        expect(utils.viewPath(page1 as TasklistPage, 'applications')).toEqual('applications/pages/task-1/page-1')
        expect(utils.viewPath(page2 as TasklistPage, 'assessments')).toEqual('assessments/pages/task-2/page-2')
      })
    })

    describe('getPageName', () => {
      it('returns the page name', () => {
        expect(utils.getPageName(Page1)).toEqual('page-1')
      })
    })

    describe('getTaskName', () => {
      it('returns the task name', () => {
        expect(utils.getTaskName(Page1)).toEqual('task-1')
      })
    })
  })

  describe('getBody', () => {
    it('if there is userInput it returns it', () => {
      const input = { user: 'input' }

      expect(
        utils.getBody({} as TasklistPageInterface, {} as ApprovedPremisesApplication, {} as Request, input),
      ).toEqual(input)
    })

    it('if there isnt userInput and there is a request body the request body is returned', () => {
      const request: DeepMocked<Request> = createMock<Request>()

      expect(utils.getBody({} as TasklistPageInterface, {} as ApprovedPremisesApplication, request, {}))
    })

    it('if there is neither a request body or userInput then getPageFromApplicationData is called and returns the data for that page', () => {
      const page: DeepMocked<TasklistPageInterface> = createMock<TasklistPageInterface>()
      const pageData = { task: { page: 'returnMe' } }
      const application = applicationFactory.build({ data: pageData })

      jest.spyOn(utils, 'getPageName').mockImplementation(() => 'page')
      jest.spyOn(utils, 'getTaskName').mockImplementation(() => 'task')

      jest
        .spyOn(utils, 'pageDataFromApplicationOrAssessment')
        .mockImplementation((_, applicationInput) => applicationInput.data)

      expect(utils.getBody(page, application, { body: {} } as Request, {})).toBe('returnMe')
    })
  })

  describe('generateResponsesForYesNoAndCommentsSections ', () => {
    it('generates the responses given the sections and body', () => {
      expect(
        utils.responsesForYesNoAndCommentsSections({ questionName: 'question copy' }, { questionName: 'response' }),
      ).toEqual({
        'question copy': 'Response',
      })
    })
  })

  describe('pageBodyShallowEquals', () => {
    it('returns true when the two parameters are equal', () => {
      const value1 = {
        'some-key': 'some-value',
        'some-key-2': ['value1', 'value2'],
      }

      const value2 = {
        'some-key': 'some-value',
        'some-key-2': ['value1', 'value2'],
      }

      expect(utils.pageBodyShallowEquals(value1, value2)).toEqual(true)
      expect(utils.pageBodyShallowEquals(value2, value1)).toEqual(true)
    })

    it('returns false when the one parameter is a subset of the other', () => {
      const value1 = {
        'some-key': 'some-value',
        'some-key-2': ['value1', 'value2'],
      }

      const value2 = {
        'some-key': 'some-value',
      }

      expect(utils.pageBodyShallowEquals(value1, value2)).toEqual(false)
      expect(utils.pageBodyShallowEquals(value2, value1)).toEqual(false)
    })

    it('returns false when one parameter contains a different array to the other', () => {
      const value1 = {
        'some-key': 'some-value',
        'some-key-2': ['value1', 'value2', 'value3'],
      }

      const value2 = {
        'some-key': 'some-value',
        'some-key-2': ['value1', 'value2'],
      }

      expect(utils.pageBodyShallowEquals(value1, value2)).toEqual(false)
      expect(utils.pageBodyShallowEquals(value2, value1)).toEqual(false)
    })

    it('returns false when parameters contains an inner object', () => {
      const value1 = {
        'some-key': 'some-value',
        'some-key-2': { 'inner-key': 'inner-value' },
      }

      const value2 = {
        'some-key': 'some-value',
        'some-key-2': { 'inner-key': 'inner-value' },
      }

      expect(utils.pageBodyShallowEquals(value1, value2)).toEqual(false)
      expect(utils.pageBodyShallowEquals(value2, value1)).toEqual(false)
    })
  })
})
