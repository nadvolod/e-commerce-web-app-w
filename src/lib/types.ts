export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  createdAt: string
  updatedAt: string
}

export type TodoFilter = 'all' | 'active' | 'completed'

export interface TodoState {
  todos: Todo[]
  filter: TodoFilter
  isLoading: boolean
  error: string | null
}

export interface CreateTodoData {
  title: string
  description?: string
}

export interface UpdateTodoData {
  title?: string
  description?: string
  completed?: boolean
}