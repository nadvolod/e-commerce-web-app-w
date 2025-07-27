import { useState, KeyboardEvent } from 'react'
import { Plus } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { CreateTodoData } from '@/lib/types'

interface AddTodoFormProps {
  onAdd: (data: CreateTodoData) => Promise<boolean>
  isLoading: boolean
}

export function AddTodoForm({ onAdd, isLoading }: AddTodoFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [showDescription, setShowDescription] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim()) return

    const success = await onAdd({
      title: title.trim(),
      description: description.trim() || undefined
    })

    if (success) {
      setTitle('')
      setDescription('')
      setShowDescription(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleTitleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (title.trim()) {
        if (showDescription) {
          handleSubmit()
        } else {
          setShowDescription(true)
        }
      }
    }
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTitleKeyDown}
            placeholder="What needs to be done?"
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSubmit}
            disabled={!title.trim() || isLoading}
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
        
        {showDescription && (
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a description (optional)..."
            className="resize-none"
            rows={2}
            disabled={isLoading}
          />
        )}
        
        {!showDescription && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDescription(true)}
            className="text-muted-foreground"
          >
            + Add description
          </Button>
        )}
      </div>
    </Card>
  )
}