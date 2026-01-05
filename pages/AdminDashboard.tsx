import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Order, User } from '../types';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'analytics'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, usersData] = await Promise.all([
          api.getAdminOrders(),
          api.getAdminUsers()
        ]);
        setOrders(ordersData);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSales = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const activeOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;

  const stats = [
    { label: 'Total Sales', value: `$${totalSales.toFixed(2)}`, trend: 'Lifetime', icon: 'fa-chart-line' },
    { label: 'Active Orders', value: activeOrdersCount.toString(), trend: 'Pending/Processing', icon: 'fa-box' },
    { label: 'Total Users', value: users.length.toString(), trend: 'Registered', icon: 'fa-users' },
  ];

  if (loading) return <div className="p-10 text-center">Loading admin dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Admin Control</h1>
            <p className="text-gray-500">Managing Fresh Life Style operations.</p>
          </div>
          <div className="mt-6 md:mt-0 flex space-x-2 bg-white p-2 rounded-2xl shadow-sm">
            {(['orders', 'users', 'analytics'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl text-sm font-bold uppercase transition-all ${
                  activeTab === tab ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
               <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                    <i className={`fa-solid ${stat.icon} text-gray-800`}></i>
                 </div>
                 <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full">{stat.trend}</span>
               </div>
               <h3 className="text-gray-500 font-bold uppercase text-sm mb-2">{stat.label}</h3>
               <p className="text-4xl font-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          {activeTab === 'orders' && (
            <div className="p-8">
              <h2 className="text-2xl font-black mb-6">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-100">
                      <th className="pb-4 font-bold text-gray-400 uppercase text-xs">Order ID</th>
                      <th className="pb-4 font-bold text-gray-400 uppercase text-xs">User ID</th>
                      <th className="pb-4 font-bold text-gray-400 uppercase text-xs">Amount</th>
                      <th className="pb-4 font-bold text-gray-400 uppercase text-xs">Status</th>
                      <th className="pb-4 font-bold text-gray-400 uppercase text-xs">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.map(order => (
                      <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
                        <td className="py-4 font-mono text-sm">{order.id}</td>
                        <td className="py-4 text-sm">{order.user_id}</td>
                        <td className="py-4 font-bold">${order.total_amount}</td>
                        <td className="py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-gray-500">{new Date(order.created_at || '').toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="p-8">
              <h2 className="text-2xl font-black mb-6">All Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-100">
                      <th className="pb-4 font-bold text-gray-400 uppercase text-xs">User</th>
                      <th className="pb-4 font-bold text-gray-400 uppercase text-xs">Email</th>
                      <th className="pb-4 font-bold text-gray-400 uppercase text-xs">Role</th>
                      <th className="pb-4 font-bold text-gray-400 uppercase text-xs">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(u => (
                      <tr key={u.id} className="group hover:bg-gray-50 transition-colors">
                        <td className="py-4 flex items-center gap-3">
                            <img src={u.avatar} alt="" className="w-8 h-8 rounded-full bg-gray-200" />
                            <span className="font-bold">{u.name}</span>
                        </td>
                        <td className="py-4 text-sm">{u.email}</td>
                        <td className="py-4">
                            {u.isAdmin || (u as any).is_admin ? (
                                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-bold">ADMIN</span>
                            ) : (
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">USER</span>
                            )}
                        </td>
                        <td className="py-4 text-sm text-gray-500">{new Date((u as any).created_at || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'analytics' && (
             <div className="p-8 text-center text-gray-500">
                 Analytics module coming soon.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;