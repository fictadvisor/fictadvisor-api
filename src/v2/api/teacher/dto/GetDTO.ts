export interface GetDTO {
  fields?: string[],
}

export interface TeacherFieldsDTO {
  select?: {
    id?: boolean,
    firstName?: boolean,
    middleName?: boolean,
    lastName?: boolean,
    description?: boolean,
    avatar?: boolean,
    disciplineTeachers?: boolean
  },
}