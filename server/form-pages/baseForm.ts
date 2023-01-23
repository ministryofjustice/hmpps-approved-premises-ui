import { FormPages, Task } from '@approved-premises/ui'

export default class BaseForm {
  static pages: FormPages

  static sections: Array<{
    title: string
    name: string
    tasks: Array<Task>
  }>
}
