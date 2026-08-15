import React from 'react';
import { Plus, Edit, Trash2, Video, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router';

function Admin() {
  const navigate = useNavigate();
  
  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add a new coding problem to the platform with full test case configuration.',
      icon: Plus,
      iconBg: 'bg-green-500/10',
      iconColor: 'text-green-500',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Edit existing problems, tweak test cases, and update reference solutions.',
      icon: Edit,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Permanently remove problems from the platform database.',
      icon: Trash2,
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-500',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Solutions',
      description: 'Manage and upload video explanations for coding challenges.',
      icon: Video,
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      route: '/admin/video'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-900 text-gray-300 font-sans pb-20">
      
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="flex flex-col items-center justify-center text-center mb-16 space-y-4">
          
          <h1 className="text-4xl font-bold text-gray-100 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 text-lg max-w-xl">
            Manage your coding problems and platform content.
          </p>
        </div>

        {/* Admin Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.id}
                onClick={() => navigate(option.route)}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 transition-colors duration-200 hover:bg-gray-700 hover:border-gray-500 cursor-pointer flex flex-col"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`${option.iconBg} p-3 rounded-xl`}>
                    <IconComponent size={24} className={option.iconColor} />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-200">
                    {option.title}
                  </h2>
                </div>
                
                <p className="text-gray-500 text-sm leading-relaxed">
                  {option.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Admin;