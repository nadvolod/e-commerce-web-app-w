import { Todo, CreateTodoData, UpdateTodoData } from './types'

export function createTodo(data: CreateTodoData): Todo {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    title: data.title.trim(),
    description: data.description?.trim(),
    completed: false,
    createdAt: now,
    updatedAt: now
  }
}

export function updateTodo(todo: Todo, updates: UpdateTodoData): Todo {
  return {
    ...todo,
    ...updates,
    updatedAt: new Date().toISOString()
  }
}

export function validateTodoTitle(title: string): string | null {
  const trimmed = title.trim()
  if (!trimmed) {
    return 'Todo title cannot be empty'
  }
  if (trimmed.length > 200) {
    return 'Todo title must be less than 200 characters'
  }
  return null
}

export function validateTodoDescription(description?: string): string | null {
  if (description && description.length > 1000) {
    return 'Todo description must be less than 1000 characters'
  }
  return null
}

export function filterTodos(todos: Todo[], filter: 'all' | 'active' | 'completed'): Todo[] {
  switch (filter) {
    case 'active':
      return todos.filter(todo => !todo.completed)
    case 'completed':
      return todos.filter(todo => todo.completed)
    default:
      return todos
  }
}

export function getTodoStats(todos: Todo[]) {
  const total = todos.length
  const completed = todos.filter(todo => todo.completed).length
  const active = total - completed
  
  return { total, completed, active }
}