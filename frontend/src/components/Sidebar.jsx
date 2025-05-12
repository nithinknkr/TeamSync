import { FaTasks, FaProjectDiagram, FaCalendarAlt, FaHome } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeTab }) => {
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaHome />, href: '/dashboard' },
    { id: 'tasks', label: 'My Tasks', icon: <FaTasks />, href: '/tasks' },
    { id: 'projects', label: 'Projects', icon: <FaProjectDiagram />, href: '/projects' },
    { id: 'calendar', label: 'Calendar', icon: <FaCalendarAlt />, href: '/calendar' }
  ];

  const handleNavigation = (href) => {
    navigate(href);
  };

  return (
    <div className="bg-gray-900 text-white w-64 flex-shrink-0 hidden md:block">
      <nav className="mt-5">
        <div className="px-2 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.href)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === item.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="mr-3 h-5 w-5">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;

