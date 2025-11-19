import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import * as api from '../services/api';
import { UserReport, MonetizationReport, ImpactReport, ClaimsReport } from '../types';
import Spinner from '../components/Spinner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#2e7d32', '#66bb6a', '#a5d6a7', '#1b5e20', '#81c784'];

// Función para obtener fechas por defecto (últimos 30 días)
const getDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
    };
};

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState(getDefaultDateRange);

    const [userReport, setUserReport] = useState<UserReport | null>(null);
    const [monetizationReport, setMonetizationReport] = useState<MonetizationReport | null>(null);
    const [impactReport, setImpactReport] = useState<ImpactReport | null>(null);
    const [claimsReport, setClaimsReport] = useState<ClaimsReport | null>(null);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { startDate: dateRange.startDate, endDate: dateRange.endDate };
            const [users, monetization, impact, claims] = await Promise.all([
                api.getUsersReport(params),
                api.getMonetizationReport(params),
                api.getImpactReport(params),
                api.getClaimsReport(params),
            ]);
            setUserReport(users);
            setMonetizationReport(monetization);
            setImpactReport(impact);
            setClaimsReport(claims);
        } catch (err) {
            setError("No se pudieron cargar los reportes. Asegúrate de tener permisos de administrador.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateRange(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const generatePDF = async () => {
        const element = document.getElementById('admin-dashboard-content');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Improve quality
                useCORS: true, // Handle images if any
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 297; // A4 landscape width
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`reporte_admin_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (err) {
            console.error("Error generating PDF:", err);
            alert("Error al generar el PDF. Por favor intente de nuevo.");
        }
    };

    const renderTabContent = () => {
        if (loading) return <Spinner />;
        if (error) return <p className="text-red-500 text-center">{error}</p>;

        switch (activeTab) {
            case 'users': return userReport && <UsersReportTab data={userReport} />;
            case 'monetization': return monetizationReport && <MonetizationReportTab data={monetizationReport} />;
            case 'impact': return impactReport && <ImpactReportTab data={impactReport} />;
            case 'claims': return claimsReport && <ClaimsReportTab data={claimsReport} />;
            default: return <p>Selecciona una pestaña.</p>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8" id="admin-dashboard-content">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold text-green-dark">Panel de Administración</h1>
                <button
                    onClick={generatePDF}
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center gap-2"
                >
                    <span>📄</span> Descargar Reporte PDF
                </button>
            </div>

            {/* Controles de Fecha */}
            <div className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4" data-html2canvas-ignore="true">
                <label htmlFor="startDate">Desde:</label>
                <input type="date" id="startDate" name="startDate" value={dateRange.startDate} onChange={handleDateChange} className="border p-2 rounded" />
                <label htmlFor="endDate">Hasta:</label>
                <input type="date" id="endDate" name="endDate" value={dateRange.endDate} onChange={handleDateChange} className="border p-2 rounded" />
                <button onClick={fetchReports} className="bg-green-primary text-white py-2 px-4 rounded hover:bg-green-dark">
                    Filtrar
                </button>
            </div>

            <div className="flex border-b border-gray-300">
                <TabButton name="users" activeTab={activeTab} setActiveTab={setActiveTab}>Usuarios</TabButton>
                <TabButton name="monetization" activeTab={activeTab} setActiveTab={setActiveTab}>Monetización</TabButton>
                <TabButton name="impact" activeTab={activeTab} setActiveTab={setActiveTab}>Impacto</TabButton>
                <TabButton name="claims" activeTab={activeTab} setActiveTab={setActiveTab}>Reclamos</TabButton>
            </div>
            <div>
                {renderTabContent()}
            </div>
        </div>
    );
};

// --- Componentes (sin cambios en KpiCard y TabButton) ---
interface TabButtonProps { name: string; activeTab: string; setActiveTab: (name: string) => void; children: React.ReactNode; }
const TabButton: React.FC<TabButtonProps> = ({ name, activeTab, setActiveTab, children }) => (<button onClick={() => setActiveTab(name)} className={`px-6 py-3 text-lg font-semibold transition-colors ${activeTab === name ? 'border-b-4 border-green-primary text-green-primary' : 'text-gray-500 hover:text-green-dark'}`}>{children}</button>);
const KpiCard: React.FC<{ title: string; value: string | number; description?: string }> = ({ title, value, description }) => (<div className="bg-white p-6 rounded-lg shadow-lg text-center"><h3 className="text-lg text-gray-600 mb-2">{title}</h3><p className="text-4xl font-extrabold text-green-primary">{value}</p>{description && <p className="text-sm text-gray-500 mt-2">{description}</p>}</div>);

// --- Pestañas de Reportes (Actualizadas) ---

const UsersReportTab: React.FC<{ data: UserReport }> = ({ data }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KpiCard title="Total Usuarios" value={data.totalUsers} />
            <KpiCard title="Nuevos en Periodo" value={data.newUsersInPeriod} />
            <KpiCard title="Activos en Periodo" value={data.activeUsersInPeriod} />
            <KpiCard title="Inactivos" value={data.inactiveUsers} description="Sin actividad antes del periodo" />
        </div>
    </div>
);

const MonetizationReportTab: React.FC<{ data: MonetizationReport }> = ({ data }) => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KpiCard title="Ingresos en Periodo" value={`${data.revenueInPeriod.toFixed(2)} Bs.`} />
            <KpiCard title="Intercambios en Periodo" value={data.exchangesInPeriod} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg h-96">
            <h3 className="text-xl font-bold mb-4">Flujo de Créditos en el Periodo</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'Créditos', Comprados: data.creditsPurchasedInPeriod, Intercambiados: data.creditsExchangedInPeriod }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Comprados" fill="#2e7d32" />
                    <Bar dataKey="Intercambiados" fill="#66bb6a" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const ImpactReportTab: React.FC<{ data: ImpactReport }> = ({ data }) => (
    <div className="space-y-8">
        <KpiCard title="Total Items Intercambiados" value={data.impactByCategory.reduce((sum, cat) => sum + cat.itemsExchanged, 0)} />
        <div className="bg-white p-6 rounded-lg shadow-lg h-96">
            <h3 className="text-xl font-bold mb-4">Items Intercambiados por Categoría</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.impactByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="categoryName" width={150} />
                    <Tooltip />
                    <Bar dataKey="itemsExchanged" fill="#a5d6a7" name="Items" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </div>
);

const ClaimsReportTab: React.FC<{ data: ClaimsReport }> = ({ data }) => (
    <div className="space-y-8">
        <KpiCard title="Total de Reclamos en Periodo" value={data.claimsByStatus.reduce((sum, s) => sum + s.count, 0)} />
        <div className="bg-white p-6 rounded-lg shadow-lg h-96">
            <h3 className="text-xl font-bold mb-4">Reclamos por Estado</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data.claimsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={120} label>
                        {data.claimsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    </div>
);

export default AdminPage;