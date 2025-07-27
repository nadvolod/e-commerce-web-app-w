import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { TodoFilter } from '@/lib/types'

interface TodoFiltersProps {
  filter: TodoFilter
  onFilterChange: (filter: TodoFilter) => void
  stats: {
    total: number
    active: number
    completed: number
  }
}

export function TodoFilters({ filter, onFilterChange, stats }: TodoFiltersProps) {
  return (
    <Tabs value={filter} onValueChange={(value) => onFilterChange(value as TodoFilter)}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all" className="flex items-center gap-2">
          All
          <Badge variant="secondary" className="text-xs">
            {stats.total}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="active" className="flex items-center gap-2">
          Active
          <Badge variant="secondary" className="text-xs">
            {stats.active}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex items-center gap-2">
          Completed
          <Badge variant="secondary" className="text-xs">
            {stats.completed}
          </Badge>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}