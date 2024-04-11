import { path } from 'static-path'

const people = path('/people')
const timeline = people.path('timeline')

const paths = {
  timeline: {
    find: timeline.path('find'),
    show: timeline.path('show'),
  },
}

export default paths
