import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, Building2, Truck, FileText, CalendarClock, Briefcase, Activity
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/api/admin';

export default function AdminEntities() {
  const location = useLocation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Determine entity from path
  const pathParts = location.pathname.split('/');
  const entity = pathParts[pathParts.length - 1]; // e.g., 'users', 'businesses'

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('driva_token') || 'test-token';
        const res = await axios.get(`${API_BASE}/${entity}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load data for ' + entity);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [entity]);

  const renderTable = () => {
    if (loading) return <div className="text-white">Loading data...</div>;
    if (error) return <div className="text-red-400">{error}</div>;
    if (!data || data.length === 0) return <div className="text-slate-400">No {entity} found.</div>;

    const columns = Object.keys(data[0]);

    return (
      <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-800">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-6 py-4 font-medium">{col.replace('_', ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                {columns.map((col) => (
                  <td key={col} className="px-6 py-4 font-light">
                    {String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const getTitle = () => {
    const map: Record<string, {title: string, icon: any, desc: string}> = {
      users: { title: 'User Management', icon: Users, desc: 'Manage platform users and roles' },
      businesses: { title: 'Business Profiles', icon: Building2, desc: 'Enterprise customers and shippers' },
      fleets: { title: 'Fleet Owners', icon: Truck, desc: 'Registered fleet providers' },
      agencies: { title: 'Logistics Agencies', icon: Briefcase, desc: 'Registered logistics agencies' },
      drivers: { title: 'Driver Network', icon: Activity, desc: 'Verified platform drivers' },
      vehicles: { title: 'Vehicle Registry', icon: Truck, desc: 'Commercial vehicles in network' },
      bookings: { title: 'Global Bookings', icon: CalendarClock, desc: 'All platform transactions and bookings' },
    };
    return map[entity] || { title: 'Management', icon: FileText, desc: 'System management' };
  };

  const { title, icon: Icon, desc } = getTitle();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Icon className="w-8 h-8 text-blue-500" />
            {title}
          </h1>
          <p className="text-slate-400 mt-2">{desc}</p>
        </div>
      </div>
      
      {renderTable()}
    </div>
  );
}
