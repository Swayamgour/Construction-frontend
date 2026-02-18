import React, { useState } from 'react';
import {
  HiOutlineBuilding,
  HiOutlineCalendar,
  HiOutlineChartBar,
  HiOutlineCurrencyRupee,
  HiOutlineUsers,
  HiOutlineClipboardCheck,
  HiOutlineExclamationCircle,
  HiOutlineTrendingUp,
  HiOutlineSearch,
  HiOutlineBell,
  HiOutlineCog,
  HiOutlineMenu,
  HiOutlineX
} from 'react-icons/hi';
import {
  FaHardHat,
  FaTruckLoading,
  FaTools,
  FaChartLine,
  FaRegCheckCircle,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';

const ConstructionDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('overview');

  // Mock data for the dashboard
  const statsData = {
    projects: {
      total: 24,
      active: 18,
      completed: 6,
      delayed: 3
    },
    financials: {
      budget: '₹8.42 Cr',
      spent: '₹5.76 Cr',
      remaining: '₹2.66 Cr',
      utilization: '68%'
    },
    team: {
      total: 156,
      onsite: 142,
      offsite: 14
    },
    tasks: {
      total: 284,
      completed: 189,
      pending: 95,
      overdue: 12
    }
  };

  const projectsData = [
    {
      id: 1,
      name: 'Grand Luxury Apartments',
      location: 'West Delhi',
      progress: 75,
      status: 'On Track',
      budget: '₹2.5 Cr',
      spent: '₹1.8 Cr',
      timeline: '15 Months',
      startDate: 'Jan 2024',
      endDate: 'Mar 2025',
      manager: 'Rajesh Kumar'
    },
    {
      id: 2,
      name: 'Metro Commercial Complex',
      location: 'South Delhi',
      progress: 45,
      status: 'Delayed',
      budget: '₹4.2 Cr',
      spent: '₹2.1 Cr',
      timeline: '18 Months',
      startDate: 'Mar 2024',
      endDate: 'Aug 2025',
      manager: 'Priya Sharma'
    },
    {
      id: 3,
      name: 'Smart City Infrastructure',
      location: 'Gurgaon',
      progress: 90,
      status: 'On Track',
      budget: '₹6.8 Cr',
      spent: '₹6.1 Cr',
      timeline: '24 Months',
      startDate: 'Jun 2023',
      endDate: 'May 2025',
      manager: 'Amit Patel'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      project: 'Grand Luxury Apartments',
      activity: 'Concrete pouring completed for Floor 12',
      time: '2 hours ago',
      type: 'progress'
    },
    {
      id: 2,
      project: 'Metro Commercial Complex',
      activity: 'Material delivery delayed - Steel rods',
      time: '5 hours ago',
      type: 'delay'
    },
    {
      id: 3,
      project: 'Smart City Infrastructure',
      activity: 'Safety inspection passed',
      time: '1 day ago',
      type: 'safety'
    },
    {
      id: 4,
      project: 'Grand Luxury Apartments',
      activity: 'Payment processed for AK Construction',
      time: '1 day ago',
      type: 'payment'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      'On Track': 'bg-green-100 text-green-700 border-green-300',
      'Delayed': 'bg-red-100 text-red-700 border-red-300',
      'At Risk': 'bg-amber-100 text-amber-700 border-amber-300',
      'Completed': 'bg-blue-100 text-blue-700 border-blue-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getActivityIcon = (type) => {
    const icons = {
      progress: <FaChartLine className="text-green-500" />,
      delay: <FaExclamationTriangle className="text-red-500" />,
      safety: <FaRegCheckCircle className="text-blue-500" />,
      payment: <HiOutlineCurrencyRupee className="text-purple-500" />
    };
    return icons[type] || <FaClock className="text-gray-500" />;
  };

  const StatCard = ({ title, value, subtitle, icon, color = 'blue', trend }) => {
    const colorConfig = {
      blue: { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-600' },
      green: { bg: 'from-green-500 to-emerald-500', text: 'text-green-600' },
      amber: { bg: 'from-amber-500 to-orange-500', text: 'text-amber-600' },
      purple: { bg: 'from-purple-500 to-pink-500', text: 'text-purple-600' }
    };

    const config = colorConfig[color] || colorConfig.blue;

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-r ${config.bg} rounded-2xl flex items-center justify-center text-white`}>
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center text-sm font-semibold ${config.text}`}>
              <HiOutlineTrendingUp className="mr-1" />
              {trend}
            </div>
          )}
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-1">{value}</h3>
        <p className="text-slate-600 font-medium text-sm">{title}</p>
        {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
      </div>
    );
  };

  const ProgressBar = ({ percentage, color = 'blue' }) => {
    const colorConfig = {
      blue: 'from-blue-500 to-cyan-500',
      green: 'from-green-500 to-emerald-500',
      red: 'from-red-500 to-rose-500',
      amber: 'from-amber-500 to-orange-500'
    };

    return (
      <div className="w-full bg-slate-200 rounded-full h-3 shadow-inner">
        <div
          className={`h-3 rounded-full bg-gradient-to-r ${colorConfig[color]} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        >
          <div className="h-full w-10 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-shimmer"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold">
              <FaHardHat className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-slate-900 to-blue-800 bg-clip-text text-transparent">
                BuildFlow
              </h1>
              <p className="text-xs text-slate-500">Construction Suite</p>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <HiOutlineX className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {[
            { id: 'overview', label: 'Overview', icon: <HiOutlineChartBar /> },
            { id: 'projects', label: 'Projects', icon: <HiOutlineBuilding /> },
            { id: 'financials', label: 'Financials', icon: <HiOutlineCurrencyRupee /> },
            { id: 'team', label: 'Team', icon: <HiOutlineUsers /> },
            { id: 'tasks', label: 'Tasks', icon: <HiOutlineClipboardCheck /> },
            { id: 'calendar', label: 'Calendar', icon: <HiOutlineCalendar /> },
            { id: 'reports', label: 'Reports', icon: <FaChartLine /> }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all duration-300 ${
                activeView === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200">
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-semibold">
              RK
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">Rajesh Kumar</p>
              <p className="text-xs text-slate-500 truncate">Project Director</p>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition-colors">
              <HiOutlineCog className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <HiOutlineMenu className="h-6 w-6 text-slate-600" />
              </button>
              <h2 className="text-2xl font-black text-slate-900 capitalize">{activeView}</h2>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <HiOutlineSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search projects, tasks..."
                  className="w-80 pl-11 pr-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
              </div>

              <button className="relative p-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-colors">
                <HiOutlineBell className="h-6 w-6" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="w-px h-8 bg-slate-300"></div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">Rajesh Kumar</p>
                  <p className="text-xs text-slate-500">Project Director</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-semibold">
                  RK
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Active Projects"
              value={statsData.projects.active}
              subtitle={`${statsData.projects.completed} completed`}
              icon={<HiOutlineBuilding className="h-6 w-6" />}
              color="blue"
              trend="+12%"
            />
            <StatCard
              title="Budget Utilization"
              value={statsData.financials.utilization}
              subtitle={`${statsData.financials.remaining} remaining`}
              icon={<HiOutlineCurrencyRupee className="h-6 w-6" />}
              color="green"
              trend="+5%"
            />
            <StatCard
              title="Team Members"
              value={statsData.team.total}
              subtitle={`${statsData.team.onsite} onsite`}
              icon={<HiOutlineUsers className="h-6 w-6" />}
              color="purple"
              trend="+8%"
            />
            <StatCard
              title="Tasks Completed"
              value={statsData.tasks.completed}
              subtitle={`${statsData.tasks.pending} pending`}
              icon={<HiOutlineClipboardCheck className="h-6 w-6" />}
              color="amber"
              trend="+15%"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Projects Section */}
            <div className="xl:col-span-2 space-y-8">
              {/* Projects List */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Active Projects</h3>
                  <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                    View All Projects →
                  </button>
                </div>

                <div className="space-y-4">
                  {projectsData.map((project) => (
                    <div key={project.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 hover:border-blue-300 transition-all duration-300 group">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {project.name}
                          </h4>
                          <p className="text-slate-600 text-sm">{project.location}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm text-slate-600 mb-2">
                            <span>Progress</span>
                            <span className="font-semibold">{project.progress}%</span>
                          </div>
                          <ProgressBar 
                            percentage={project.progress} 
                            color={project.status === 'Delayed' ? 'red' : 'green'}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Budget</p>
                            <p className="font-semibold text-slate-900">{project.budget}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Timeline</p>
                            <p className="font-semibold text-slate-900">{project.timeline}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
                              {project.manager.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="text-sm text-slate-600">{project.manager}</span>
                          </div>
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                            View Details →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Add Project', icon: <HiOutlineBuilding />, color: 'blue' },
                    { label: 'Record Payment', icon: <HiOutlineCurrencyRupee />, color: 'green' },
                    { label: 'Schedule Task', icon: <HiOutlineCalendar />, color: 'purple' },
                    { label: 'Generate Report', icon: <FaChartLine />, color: 'amber' }
                  ].map((action, index) => (
                    <button
                      key={index}
                      className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 group"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r from-${action.color}-500 to-${action.color}-600 rounded-2xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                        {action.icon}
                      </div>
                      <span className="text-sm font-semibold text-slate-900 text-center">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group">
                      <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{activity.project}</p>
                        <p className="text-sm text-slate-600 mt-1">{activity.activity}</p>
                        <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Upcoming Deadlines</h3>
                <div className="space-y-4">
                  {[
                    { project: 'Grand Luxury Apartments', task: 'Structural Inspection', date: 'Tomorrow', priority: 'high' },
                    { project: 'Metro Commercial Complex', task: 'Material Delivery', date: 'Dec 15', priority: 'medium' },
                    { project: 'Smart City Infrastructure', task: 'Final Documentation', date: 'Dec 20', priority: 'low' }
                  ].map((deadline, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-amber-300 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{deadline.task}</p>
                        <p className="text-xs text-slate-600">{deadline.project}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          deadline.priority === 'high' ? 'bg-red-100 text-red-700' :
                          deadline.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {deadline.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4">Performance Score</h3>
                <div className="text-4xl font-black mb-2">87%</div>
                <p className="text-blue-100 text-sm mb-4">Project Efficiency Rating</p>
                <div className="space-y-3">
                  {[
                    { label: 'Timeline Adherence', value: 82 },
                    { label: 'Budget Management', value: 91 },
                    { label: 'Quality Control', value: 88 },
                    { label: 'Safety Compliance', value: 95 }
                  ].map((metric, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{metric.label}</span>
                        <span>{metric.value}%</span>
                      </div>
                      <div className="w-full bg-blue-500 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full bg-white transition-all duration-1000"
                          style={{ width: `${metric.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConstructionDashboard;