import 'reflect-metadata'
// Use a wildcard import to allow us to use jest.spyOn on functions within this module
import * as utils from './index'

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

      expect(utils.yesOrNoResponseWithDetail('foo', body)).toEqual('Yes - Some Detail')
    })

    it('returns no detail if the answer is no', () => {
      const body = { foo: 'no' }

      expect(utils.yesOrNoResponseWithDetail('foo', body)).toEqual('No')
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

      Reflect.defineMetadata('section:name', 'Section', Section)
      Reflect.defineMetadata('section:tasks', [Task], Section)
    })

    describe('getTask', () => {
      it('fetches metadata for a specific task and pages', () => {
        expect(utils.getTask(Task)).toEqual({ id: 'slug', title: 'Name', pages: { 'page-1': Page1, 'page-2': Page2 } })
      })
    })

    describe('getSection', () => {
      it('fetches metadata for a specific section and tasks', () => {
        expect(utils.getSection(Section)).toEqual({
          title: 'Section',
          tasks: [utils.getTask(Task)],
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
              tasks: [{ id: 'foo', title: 'Foo', pages: { 'page-1': Page1, 'page-2': Page2 } }],
            }
          }
          return {
            title: 'Section 2',
            tasks: [{ id: 'bar', title: 'Bar', pages: { 'page-3': Page1, 'page-4': Page2 } }],
          }
        })

        expect(utils.getPagesForSections([Section1, Section2])).toEqual({
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

        expect(utils.viewPath(page1)).toEqual('applications/pages/task-1/page-1')
        expect(utils.viewPath(page2)).toEqual('applications/pages/task-2/page-2')
      })
    })
  })
})
