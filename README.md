# Todo App

A beautiful, functional todo application built with React, TypeScript, and Tailwind CSS. Features persistent storage, optimistic UI updates, and a clean modern design.

## Features

- ✅ **Add, edit, delete todos** with inline editing
- ✅ **Mark todos as complete/incomplete** with visual feedback
- ✅ **Filter todos** by all, active, or completed
- ✅ **Persistent storage** using Spark KV storage
- ✅ **Optimistic UI updates** for smooth user experience
- ✅ **Toast notifications** for user feedback
- ✅ **Responsive design** that works on all devices
- ✅ **Keyboard shortcuts** for power users
- ✅ **Undo functionality** for accidental deletions
- ✅ **Progress tracking** with statistics

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Animations**: Framer Motion
- **Icons**: Phosphor Icons
- **Notifications**: Sonner
- **State Management**: React hooks + Spark KV persistence
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. The app is already set up in this Spark environment
2. Install dependencies (if needed):
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at the local development URL provided by Spark.

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Usage

### Adding Todos
- Type in the input field and press Enter or click "Add"
- Click "+ Add description" to include optional details
- Press Shift+Enter in description field for new lines

### Managing Todos
- **Complete**: Click the checkbox to mark as done
- **Edit**: Double-click any todo or click the pencil icon
- **Delete**: Click the trash icon (with undo option)
- **Save edits**: Press Enter or click Save
- **Cancel edits**: Press Escape or click Cancel

### Filtering
- **All**: View all todos
- **Active**: View incomplete todos only  
- **Completed**: View completed todos only
- Numbers show count for each category

### Keyboard Shortcuts
- `Enter`: Add new todo or save edits
- `Shift+Enter`: New line in description
- `Escape`: Cancel editing
- `Double-click`: Start editing todo

## Architecture

### Component Structure
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── AddTodoForm.tsx  # Todo creation form
│   ├── TodoItem.tsx     # Individual todo with editing
│   ├── TodoList.tsx     # Todo list with animations
│   └── TodoFilters.tsx  # Filter tabs with counters
├── hooks/
│   ├── use-todos.ts     # Main todo state management
│   └── use-mobile.ts    # Mobile breakpoint detection
├── lib/
│   ├── types.ts         # TypeScript interfaces
│   ├── todo-utils.ts    # Todo business logic
│   └── utils.ts         # General utilities
└── App.tsx              # Main application component
```

### State Management
- Uses Spark's `useKV` hook for persistent storage
- Optimistic updates for immediate UI feedback
- Error handling with toast notifications
- Functional state updates to avoid stale closure issues

### Data Persistence
All todos are automatically saved to Spark's KV storage and persist across browser sessions. No external database required.

## Deployment

This app is designed to run in the Spark environment which handles deployment automatically. For other environments:

1. Build the application: `npm run build`
2. Serve the `dist` folder using any static file server
3. Ensure the server supports client-side routing for SPAs

### Environment Variables
No environment variables are required. All data is stored locally using Spark's KV storage.

## Design Philosophy

The app follows modern design principles:
- **Minimalist**: Clean interface focused on tasks
- **Responsive**: Works beautifully on all screen sizes  
- **Accessible**: Keyboard navigation and proper ARIA labels
- **Performant**: Optimistic updates and efficient re-renders
- **Delightful**: Smooth animations and satisfying interactions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this code for your own projects!