import { useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { Todo, TodoFilter, CreateTodoData, UpdateTodoData } from '@/lib/types'
import { createTodo, updateTodo, filterTodos, getTodoStats } from '@/lib/todo-utils'
import { toast } from 'sonner'

export function useTodos() {
  const [todos, setTodos] = useKV<Todo[]>('todos', [])
  const [filter, setFilter] = useState<TodoFilter>('all')
  const [isLoading, setIsLoading] = useState(false)

  const addTodo = useCallback(async (data: CreateTodoData) => {
    if (!data.title.trim()) {
      toast.error('Todo title cannot be empty')
      return false
    }

    try {
      setIsLoading(true)
      const newTodo = createTodo(data)
      
      // Optimistic update
      setTodos(currentTodos => [newTodo, ...currentTodos])
      toast.success('Todo added successfully')
      return true
    } catch (error) {
      // Revert optimistic update on error
      setTodos(currentTodos => currentTodos.slice(1))
      toast.error('Failed to add todo')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [setTodos])

  const toggleTodo = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      
      // Optimistic update
      setTodos(currentTodos => 
        currentTodos.map(todo => 
          todo.id === id 
            ? updateTodo(todo, { completed: !todo.completed })
            : todo
        )
      )
    } catch (error) {
      toast.error('Failed to update todo')
      // Note: In a real app, you'd revert the optimistic update here
    } finally {
      setIsLoading(false)
    }
  }, [setTodos])

  const editTodo = useCallback(async (id: string, updates: UpdateTodoData) => {
    if (updates.title !== undefined && !updates.title.trim()) {
      toast.error('Todo title cannot be empty')
      return false
    }

    try {
      setIsLoading(true)
      
      // Optimistic update
      setTodos(currentTodos => 
        currentTodos.map(todo => 
          todo.id === id 
            ? updateTodo(todo, updates)
            : todo
        )
      )
      toast.success('Todo updated successfully')
      return true
    } catch (error) {
      toast.error('Failed to update todo')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [setTodos])

  const deleteTodo = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      let deletedTodo: Todo | undefined
      
      // Optimistic update with backup for undo
      setTodos(currentTodos => {
        deletedTodo = currentTodos.find(todo => todo.id === id)
        return currentTodos.filter(todo => todo.id !== id)
      })

      if (deletedTodo) {
        toast.success('Todo deleted', {
          action: {
            label: 'Undo',
            onClick: () => {
              if (deletedTodo) {
                setTodos(currentTodos => [deletedTodo, ...currentTodos])
                toast.success('Todo restored')
              }
            }
          }
        })
      }
    } catch (error) {
      toast.error('Failed to delete todo')
    } finally {
      setIsLoading(false)
    }
  }, [setTodos])

  const clearCompleted = useCallback(async () => {
    try {
      setIsLoading(true)
      const completedTodos = todos.filter(todo => todo.completed)
      
      if (completedTodos.length === 0) {
        toast.info('No completed todos to clear')
        return
      }

      // Optimistic update
      setTodos(currentTodos => currentTodos.filter(todo => !todo.completed))
      toast.success(`Cleared ${completedTodos.length} completed todos`)
    } catch (error) {
      toast.error('Failed to clear completed todos')
    } finally {
      setIsLoading(false)
    }
  }, [todos, setTodos])

  const filteredTodos = filterTodos(todos, filter)
  const stats = getTodoStats(todos)

  return {
    todos: filteredTodos,
    allTodos: todos,
    filter,
    setFilter,
    isLoading,
    stats,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    clearCompleted
  }
}