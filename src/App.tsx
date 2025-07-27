import { Toaster } from '@/components/ui/sonner'
import { AddTodoForm } from '@/components/AddTodoForm'
import { TodoFilters } from '@/components/TodoFilters'
import { TodoList } from '@/components/TodoList'
import { useTodos } from '@/hooks/use-todos'
import { CheckSquare } from '@phosphor-icons/react'

function App() {
  const {
    todos,
    allTodos,
    filter,
    setFilter,
    isLoading,
    stats,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    clearCompleted
  } = useTodos()

  const hasCompletedTodos = allTodos.some(todo => todo.completed)

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <CheckSquare className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Todo App
            </h1>
          </div>
          <p className="text-muted-foreground">
            Organize your tasks with ease
          </p>
        </div>

        {/* Add Todo Form */}
        <div className="mb-6">
          <AddTodoForm onAdd={addTodo} isLoading={isLoading} />
        </div>

        {/* Filters */}
        {stats.total > 0 && (
          <div className="mb-6">
            <TodoFilters
              filter={filter}
              onFilterChange={setFilter}
              stats={stats}
            />
          </div>
        )}

        {/* Todo List */}
        <TodoList
          todos={todos}
          filter={filter}
          onToggle={toggleTodo}
          onEdit={editTodo}
          onDelete={deleteTodo}
          onClearCompleted={clearCompleted}
          hasCompletedTodos={hasCompletedTodos}
        />

        {/* Progress indicator */}
        {stats.total > 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              {stats.completed} of {stats.total} todos completed
              {stats.completed > 0 && (
                <span className="text-accent">
                  ({Math.round((stats.completed / stats.total) * 100)}%)
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      <Toaster />
    </div>
  )
}

export default App