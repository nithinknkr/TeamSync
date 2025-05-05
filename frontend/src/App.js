// Add this import to your existing App.js file
import TasksPage from './pages/TasksPage';

// Add this route to your Routes component
<Route path="/tasks" element={
  <ProtectedRoute>
    <TasksPage />
  </ProtectedRoute>
} />