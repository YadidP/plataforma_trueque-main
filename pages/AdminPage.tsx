import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as api from '../services/api';
import { UserReport, MonetizationReport, ImpactReport } from '../types';
import Spinner from '../components/Spinner';

// Colores para los gráficos
const COLORS = ['#2e7d32', '#66bb6a', '#a5d6a7', '#1b5e20', '#81c784'];

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [userReport, setUserReport] = useState<UserReport | null>(null);
    const [monetizationReport, setMonetizationReport] = useState<MonetizationReport | null>(null);
    const [impactReport, setImpactReport] = useState<ImpactReport | null>(null);

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            setError(null);
            try {
                const [users, monetization, impact] = await Promise.all([
                    api.getUsersReport(),
                    api.getMonetizationReport(),
                    api.getImpactReport()
                ]);
                setUserReport(users);
                setMonetizationReport(monetization);
                setImpactReport(impact);
            } catch (err) {
                setError("No se pudieron cargar los reportes. Asegúrate de tener permisos de administrador.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const renderTabContent = () => {
        if (loading) return <Spinner />;
        if (error) return <p className="text-red-500 text-center">{error}</p>;

        switch (activeTab) {
            case 'users':
                return userReport && <UsersReportTab data={userReport} />;
            case 'monetization':
                return monetizationReport && <MonetizationReportTab data={monetizationReport} />;
            case 'impact':
                return impactReport && <ImpactReportTab data={impactReport} />;
            default:
                return <p>Selecciona una pestaña para ver el reporte.</p>;
        }
    };
    
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold text-green-dark">Panel de Administración</h1>
            <div className="flex border-b border-gray-300">
                <TabButton name="users" activeTab={activeTab} setActiveTab={setActiveTab}>Usuarios</TabButton>
                <TabButton name="monetization" activeTab={activeTab} setActiveTab={setActiveTab}>Monetización</TabButton>
                <TabButton name="impact" activeTab={activeTab} setActiveTab={setActiveTab}>Impacto</TabButton>
            </div>
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};

// --- Componentes de la página ---

interface TabButtonProps {
    name: string;
    activeTab: string;
    setActiveTab: (name: string) => void;
    children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ name, activeTab, setActiveTab, children }) => (
    <button
        onClick={() => setActiveTab(name)}
        className={`px-6 py-3 text-lg font-semibold transition-colors ${activeTab === name ? 'border-b-4 border-green-primary text-green-primary' : 'text-gray-500 hover:text-green-dark'}`}
    >
        {children}
    </button>
);

const KpiCard: React.FC<{ title: string; value: string | number; description?: string }> = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h3 className="text-lg text-gray-600 mb-2">{title}</h3>
        <p className="text-4xl font-extrabold text-green-primary">{value}</p>
        {description && <p className="text-sm text-gray-500 mt-2">{description}</p>}
    </div>
);

// --- Pestañas de Reportes ---

const UsersReportTab: React.FC<{ data: UserReport }> = ({ data }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard title="Total de Usuarios" value={data.totalUsers} />
            <KpiCard title="Usuarios Activos (30d)" value={data.activeUsers.reduce((sum, item) => sum + item.count, 0)} />
            <KpiCard title="Abandono (60d)" value={data.churnUsersCount} description="Usuarios sin actividad" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg h-96">
                <h3 className="text-xl font-bold mb-4">Usuarios Activos por Rol</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.activeUsers}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="role" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#2e7d32" name="Usuarios" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">Top 10 Usuarios por Intercambios</h3>
                 <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left p-2 font-semibold">Usuario</th>
                                <th className="text-right p-2 font-semibold">Intercambios</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.top10UsersByExchanges.map(user => (
                                <tr key={user.user_id} className="border-b">
                                    <td className="p-2">{user.name}</td>
                                    <td className="p-2 text-right font-bold">{user.total_exchanges}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
);

const MonetizationReportTab: React.FC<{ data: MonetizationReport }> = ({ data }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard title="Ingresos Totales" value={`${data.totalRevenue.toFixed(2)} Bs.`} />
            <KpiCard title="Ingresos (30d)" value={`${data.revenueLast30Days.toFixed(2)} Bs.`} />
            <KpiCard title="Usuarios Premium" value={data.activePremiumUsers} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg h-96">
            <h3 className="text-xl font-bold mb-4">Origen de los Créditos en Circulación</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data.creditSource} dataKey="amount" nameKey="source" cx="50%" cy="50%" outerRadius={120} label>
                        {data.creditSource.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString()} créditos`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const ImpactReportTab: React.FC<{ data: ImpactReport }> = ({ data }) => (
    <div className="space-y-8">
        <KpiCard title="Total de Artículos Intercambiados" value={data.totalItemsExchanged} description="Reduciendo el consumo y los desechos." />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg h-96">
                <h3 className="text-xl font-bold mb-4">Intercambios por Categoría</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.exchangesByCategory} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="categoryName" width={120} />
                        <Tooltip />
                        <Bar dataKey="totalExchanges" fill="#66bb6a" name="Intercambios"/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
             <div className="bg-white p-6 rounded-lg shadow-lg h-96">
                <h3 className="text-xl font-bold mb-4">Ratio Publicación vs. Intercambio</h3>
                <p className="text-sm text-gray-500 mb-4">Un ratio alto indica alta demanda. Un ratio bajo puede señalar una oferta que no interesa a los usuarios.</p>
                <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={data.listingToExchangeRatioByCategory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="categoryName" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`} />
                        <Bar dataKey="ratio" fill="#a5d6a7" name="Ratio" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
);

export default AdminPage;