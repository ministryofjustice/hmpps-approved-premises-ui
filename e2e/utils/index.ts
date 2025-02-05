export const datePartStrings = (date: Date): { year: string; month: string; day: string } => ({
  year: date.getFullYear().toString(),
  month: (date.getMonth() + 1).toString(),
  day: date.getDate().toString(),
})
