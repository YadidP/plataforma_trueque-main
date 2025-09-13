
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Dummy data for admin panel
const dummyUsers = [
    { id: 1, name: 'Ana', email: 'ana@email.com', role: 'usuario', balance: 115 },
    { id: 2, name: 'Pedro', email: 'pedro@email.com', role: 'usuario', balance: 90 },
    { id: 3, name: 'María', email: 'maria@email.com', role: 'emprendedor', balance: 250 },
    { id: 4, name: 'Admin User', email: 'admin@email.com', role: 'admin', balance: 1000 },
];

const dummyMetrics = {
    totalUsers: 152,
    activeListings: 230,
    exchangesLastMonth: 450,
    creditsPurchased: 12500,
};

const dummyChartData = [
    { name: 'Ropa', Intercambios: 40, CO2_Ahorrado: 80 },
    { name: 'Tecnología', Intercambios: 30, CO2_Ahorrado: 300 },
    { name: 'Educación', Intercambios: 50, Horas_Servicio: 50 },
    { name: 'Hogar', Intercambios: 20, CO2_Ahorrado: 60 },
];

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('metrics');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'users':
                return <UsersTab />;
            case 'metrics':
            default:
                return <MetricsTab />;
        }
    };
    
    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-green-dark mb-8">Panel de Administración</h1>
            <div className="flex border-b border-gray-300 mb-6">
                <TabButton name="metrics" activeTab={activeTab} setActiveTab={setActiveTab}>Métricas</TabButton>
                <TabButton name="users" activeTab={activeTab} setActiveTab={setActiveTab}>Usuarios</TabButton>
                <TabButton name="listings" activeTab={activeTab} setActiveTab={setActiveTab}>Publicaciones</TabButton>
                <TabButton name="audit" activeTab={activeTab} setActiveTab={setActiveTab}>Auditoría</TabButton>
            </div>
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};

interface TabButtonProps {
    name: string;
    activeTab: string;
    setActiveTab: (name: string) => void;
    children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ name, activeTab, setActiveTab, children }) => {
    const isActive = activeTab === name;
    return (
        <button
            onClick={() => setActiveTab(name)}
            className={`px-6 py-3 text-lg font-semibold transition-colors ${isActive ? 'border-b-4 border-green-primary text-green-primary' : 'text-gray-500 hover:text-green-dark'}`}
        >
            {children}
        </button>
    );
};

const MetricsTab = () => (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <h3 className="text-lg text-gray-600 mb-2">Total de Usuarios</h3>
                <p className="text-4xl font-extrabold text-green-primary">{dummyMetrics.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <h3 className="text-lg text-gray-600 mb-2">Publicaciones Activas</h3>
                <p className="text-4xl font-extrabold text-green-primary">{dummyMetrics.activeListings}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <h3 className="text-lg text-gray-600 mb-2">Intercambios (30 días)</h3>
                <p className="text-4xl font-extrabold text-green-primary">{dummyMetrics.exchangesLastMonth}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                <h3 className="text-lg text-gray-600 mb-2">Créditos Comprados</h3>
                <p className="text-4xl font-extrabold text-green-primary">{dummyMetrics.creditsPurchased}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg h-96">
            <h3 className="text-xl font-bold mb-4">Actividad por Categoría</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dummyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Intercambios" fill="#2e7d32" />
                    <Bar dataKey="CO2_Ahorrado" fill="#66bb6a" />
                    <Bar dataKey="Horas_Servicio" fill="#a5d6a7" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const UsersTab = () => (
    <div className="bg-white shadow-lg rounded-lg overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-green-primary text-white">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Nombre</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Email</th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Rol</th>
              <th className="text-right py-3 px-4 uppercase font-semibold text-sm">Saldo</th>
              <th className="text-center py-3 px-4 uppercase font-semibold text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {dummyUsers.map(user => (
              <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.role}</td>
                <td className="py-3 px-4 text-right font-bold">{user.balance}</td>
                <td className="py-3 px-4 text-center">
                    <button className="text-blue-500 hover:underline mr-2">Editar</button>
                    <button className="text-red-500 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
);

export default AdminPage;
