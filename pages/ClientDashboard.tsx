import React, { useEffect, useState } from 'react';
import { useApp } from '../App';
import { api } from '../services/api';
import { Order } from '../types';

const ClientDashboard: React.FC = () => {
  const { user } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.getUserOrders(user.id)
        .then(setOrders)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) return <div className="p-10 text-center">Loading orders...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-black mb-8">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl">
          <p className="text-xl text-gray-500 mb-4">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-mono font-bold text-sm md:text-base">{order.id}</p>
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-bold">{new Date(order.created_at || '').toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {(order as any).tracking_number && (
                  <div className="mb-4 bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                      <div>
                          <p className="text-xs font-bold text-gray-400 uppercase">Tracking Number</p>
                          <p className="font-mono font-bold text-blue-600">{(order as any).tracking_number}</p>
                      </div>
                      {(order as any).tracking_url && (
                          <a href={(order as any).tracking_url} target="_blank" rel="noopener noreferrer" className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100">
                             Track Package
                          </a>
                      )}
                  </div>
              )}
              
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {/* Placeholder or actual image if available in item data */}
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-400">IMG</div>
                    </div>
                    <div>
                      <p className="font-bold">Product ID: {item.product_id}</p>
                      <p className="text-sm text-gray-500">Size: {item.size} | Color: {item.color} | Qty: {item.quantity}</p>
                    </div>
                    <div className="ml-auto font-bold">
                      ${item.price_at_purchase}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t flex justify-between items-center">
                <p className="font-bold text-lg">Total</p>
                <p className="font-black text-2xl">${order.total_amount}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
