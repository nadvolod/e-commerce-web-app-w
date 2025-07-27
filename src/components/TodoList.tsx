import { AnimatePresence } from 'framer-motion'
import { CheckCircle } from '@phosphor-icons/react'
import { TodoItem } from '@/components/TodoItem'
import { Button } from '@/components/ui/button'
import { Todo, TodoFilter } from '@/lib/types'

interface TodoListProps {
  todos: Todo[]
  filter: TodoFilter
  onToggle: (id: string) => void
  onEdit: (id: string, updates: { title?: string; description?: string }) => Promise<boolean>
  onDelete: (id: string) => void
  onClearCompleted: () => void
  hasCompletedTodos: boolean
}

export function TodoList({ 
  todos, 
  filter, 
  onToggle, 
  onEdit, 
  onDelete, 
  onClearCompleted,
  hasCompletedTodos 
}: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          {filter === 'active' ? 'No active todos' : 
           filter === 'completed' ? 'No completed todos' : 
           'No todos yet'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {filter === 'active' ? 'All caught up! Time to add new tasks.' :
           filter === 'completed' ? 'Complete some todos to see them here.' :
           'Add your first todo to get started.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
      
      {hasCompletedTodos && filter !== 'active' && (
        <div className="pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearCompleted}
            className="text-muted-foreground"
          >
            Clear completed
          </Button>
        </div>
      )}
    </div>
  )
}