import { FaCheckCircle, FaHourglass, FaExclamationTriangle, FaListUl } from 'react-icons/fa';

const TaskStats = ({ tasks }) => {
  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
  const highPriorityTasks = tasks.filter(task => task.priority === 'High').length;
  
  // Calculate completion percentage
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const stats = [
    {
      id: 'total',
      name: 'Total Tasks',
      value: totalTasks,
      icon: <FaListUl className="h-6 w-6 text-gray-400" />,
      color: 'bg-gray-100'
    },
    {
      id: 'completed',
      name: 'Completed',
      value: completedTasks,
      icon: <FaCheckCircle className="h-6 w-6 text-green-500" />,
      color: 'bg-green-100'
    },
    {
      id: 'in-progress',
      name: 'In Progress',
      value: inProgressTasks,
      icon: <FaHourglass className="h-6 w-6 text-blue-500" />,
      color: 'bg-blue-100'
    },
    {
      id: 'high-priority',
      name: 'High Priority',
      value: highPriorityTasks,
      icon: <FaExclamationTriangle className="h-6 w-6 text-red-500" />,
      color: 'bg-red-100'
    }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Task Overview</h2>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map(stat => (
            <div key={stat.id} className={`${stat.color} rounded-lg p-4 flex items-center`}>
              <div className="flex-shrink-0">
                {stat.icon}
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-500">{stat.name}</div>
                <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-gray-700">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskStats;