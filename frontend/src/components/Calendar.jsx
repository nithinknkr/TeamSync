import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';

const Calendar = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1))}
          className="p-1 rounded-full hover:bg-gray-200"
        >
          <FaChevronLeft className="h-4 w-4 text-gray-600" />
        </button>
        <h2 className="text-lg font-medium text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1))}
          className="p-1 rounded-full hover:bg-gray-200"
        >
          <FaChevronRight className="h-4 w-4 text-gray-600" />
        </button>
      </div>
    );
  };
  
  const renderDays = () => {
    const days = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-xs font-medium text-gray-500 uppercase">
          {weekDays[i]}
        </div>
      );
    }
    
    return <div className="grid grid-cols-7 gap-1 mb-2">{days}</div>;
  };
  
  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    const rows = [];
    let days = [];
    let day = startDate;
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const formattedDate = format(cloneDay, 'yyyy-MM-dd');
        
        // Find tasks due on this day
        const dayTasks = tasks.filter(task => {
          if (!task.dueDate) return false;
          const taskDate = parseISO(task.dueDate);
          return isSameDay(taskDate, cloneDay);
        });
        
        days.push(
          <div
            key={formattedDate}
            className={`min-h-[60px] p-1 border ${
              !isSameMonth(day, monthStart)
                ? 'text-gray-300 bg-gray-50'
                : isSameDay(day, new Date())
                ? 'bg-blue-50 border-blue-200'
                : 'text-gray-700'
            }`}
          >
            <div className="text-right text-xs">{format(day, 'd')}</div>
            <div className="mt-1">
              {dayTasks.slice(0, 2).map((task, index) => (
                <div
                  key={index}
                  className={`text-xs truncate px-1 py-0.5 rounded mb-1 ${
                    task.priority === 'High'
                      ? 'bg-red-100 text-red-800'
                      : task.priority === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {task.title}
                </div>
              ))}
              {dayTasks.length > 2 && (
                <div className="text-xs text-gray-500 text-center">
                  +{dayTasks.length - 2} more
                </div>
              )}
            </div>
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={day} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }
    
    return <div className="space-y-1">{rows}</div>;
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <FaCalendarAlt className="mr-2 h-5 w-5 text-gray-500" />
          Calendar
        </h2>
      </div>
      
      <div className="p-4">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Upcoming Deadlines</h3>
        <div className="space-y-3">
          {tasks
            .filter(task => task.dueDate)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 3)
            .map((task, index) => (
              <div key={index} className="flex items-start">
                <div className={`flex-shrink-0 w-2 h-2 mt-1.5 rounded-full ${
                  task.priority === 'High'
                    ? 'bg-red-500'
                    : task.priority === 'Medium'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}></div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500">
                    Due: {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            ))}
          {tasks.filter(task => task.dueDate).length === 0 && (
            <p className="text-sm text-gray-500">No upcoming deadlines</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;