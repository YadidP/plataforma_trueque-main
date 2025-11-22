import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import * as api from '../services/api';
import { UserReport, MonetizationReport, ImpactReport, ClaimsReport, AdvancedReport, ClaimDetail } from '../types';
import Spinner from '../components/Spinner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#2e7d32', '#66bb6a', '#81c784', '#a5d6a7', '#c8e6c9'];
const STATUS_COLORS = {
    'abierto': '#ef5350',   // Rojo
    'en_revision': '#ffa726', // Naranja
    'resuelto': '#66bb6a',   // Verde
    'cerrado': '#bdbdbd'     // Gris
};

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('dashboard'); // Pestaña única para ver todo de un vistazo
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0], // Últimos 6 meses por defecto
        endDate: new Date().toISOString().split('T')[0],
    });

    // Estados de Datos
    const [userReport, setUserReport] = useState<UserReport | null>(null);
    const [monetizationReport, setMonetizationReport] = useState<MonetizationReport | null>(null);
    const [impactReport, setImpactReport] = useState<ImpactReport | null>(null);
    const [claimsReport, setClaimsReport] = useState<ClaimsReport | null>(null);
    const [advancedReport, setAdvancedReport] = useState<AdvancedReport | null>(null);
    const [activeClaims, setActiveClaims] = useState<ClaimDetail[]>([]);
    const [publicationsCount, setPublicationsCount] = useState<number>(0);
    const [pubsVsExchanges, setPubsVsExchanges] = useState<any[]>([]);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const params = { startDate: dateRange.startDate, endDate: dateRange.endDate };

            // Hacemos las peticiones por separado para que si falla una, no rompa todo
            try { const res = await api.getUsersReport(params); setUserReport(res); } catch (e) { console.error("Error Users", e); }
            try { const res = await api.getMonetizationReport(params); setMonetizationReport(res); } catch (e) { console.error("Error Monetization", e); }
            try { const res = await api.getImpactReport(params); setImpactReport(res); } catch (e) { console.error("Error Impact", e); }
            try { const res = await api.getClaimsReport(params); setClaimsReport(res); } catch (e) { console.error("Error Claims", e); }
            try { const res = await api.getAdvancedReport(); setAdvancedReport(res); } catch (e) { console.error("Error Advanced", e); }
            try { const res = await api.getActiveClaims(); setActiveClaims(res); } catch (e) { console.error("Error Active Claims", e); }
            try { const res = await api.getPublicationsCount(); setPublicationsCount(res.total); } catch (e) { console.error("Error Publications", e); }
            try { const res = await api.getPublicationsVsExchanges(params); setPubsVsExchanges(res); } catch (e) { console.error("Error Pubs vs Exchanges", e); }

        } catch (err) {
            console.error("Error general cargando reportes", err);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const generatePDF = async () => {
        const element = document.getElementById('admin-dashboard-content');
        if (!element) return;
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('reporte_gestion_trueque.pdf');
    };

    if (loading) return <Spinner />;

    // Preparar datos para gráficos
    const userActivityData = userReport ? [
        { name: 'Activos', value: userReport.activeUsersInPeriod },
        { name: 'Inactivos', value: userReport.inactiveUsers },
        { name: 'Nuevos', value: userReport.newUsersInPeriod }
    ] : [];

    const claimsData = claimsReport?.claimsByStatus.map(c => ({
        name: c.status.replace('_', ' ').toUpperCase(),
        value: c.count
    })) || [];

    return (
        <div className="max-w-7xl mx-auto pb-12 px-4" id="admin-dashboard-content">
            {/* Encabezado */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-4 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-green-dark">Panel de Control y Reportes</h1>
                    <p className="text-gray-600">Indicadores de desempeño, impacto y transacciones.</p>
                </div>
                <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded shadow-sm">
                    <span className="text-sm font-bold text-gray-500">Periodo:</span>
                    <input type="date" value={dateRange.startDate} onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })} className="border rounded px-2 py-1 text-sm" />
                    <span className="text-gray-400">-</span>
                    <input type="date" value={dateRange.endDate} onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })} className="border rounded px-2 py-1 text-sm" />
                    <button onClick={fetchReports} className="bg-green-primary text-white px-3 py-1 rounded hover:bg-green-dark text-sm">Actualizar</button>
                    <button onClick={generatePDF} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm flex items-center gap-1">
                        <span>📄</span> PDF
                    </button>
                </div>
            </div>

            {/* KPI CARDS (Resumen Ejecutivo) */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                <KpiCard
                    title="Usuarios Totales"
                    value={userReport?.totalUsers || 0}
                    icon="👥"
                    explanation="Base de usuarios registrados."
                />
                <KpiCard
                    title="Ingresos (Bs)"
                    value={monetizationReport?.revenueInPeriod || 0}
                    icon="💰"
                    explanation="Ingresos por venta de créditos en el periodo."
                />
                <KpiCard
                    title="Publicaciones"
                    value={publicationsCount}
                    icon="📝"
                    explanation="Total de publicaciones creadas."
                />
                <KpiCard
                    title="Intercambios"
                    value={monetizationReport?.exchangesInPeriod || 0}
                    icon="🤝"
                    explanation="Total de trueques realizados exitosamente."
                />
                <KpiCard
                    title="Reclamos Activos"
                    value={activeClaims.length}
                    icon="⚠️"
                    isNegative
                    explanation="Atención al cliente requerida."
                />
            </div>

            {/* SECCIÓN 1: ACTIVIDAD DE USUARIOS */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-green-primary pl-3">1. Actividad de Usuarios</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ChartContainer title="Distribución de Usuarios" explanation="Proporción entre usuarios activos, inactivos y nuevos. Ayuda a medir la retención.">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={userActivityData} cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {userActivityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <ChartContainer title="Tendencia de Crecimiento (Últimos Meses)" explanation="Comparativa visual de nuevos usuarios vs abandonos por mes.">
                        {advancedReport?.trends ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={advancedReport.trends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="monthLabel" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="newUsers" name="Nuevos" stroke="#2e7d32" strokeWidth={2} />
                                    <Line type="monotone" dataKey="activeUsers" name="Activos Totales" stroke="#81c784" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : <p className="text-center text-gray-400 py-10">No hay datos de tendencia disponibles</p>}
                    </ChartContainer>
                </div>
            </div>

            {/* SECCIÓN 2: TRANSACCIONES Y MONETIZACIÓN */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-green-primary pl-3">2. Intercambios y Créditos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ChartContainer title="Publicaciones vs Intercambios" explanation="Comparativa mensual de publicaciones creadas vs intercambios realizados.">
                        {pubsVsExchanges.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={pubsVsExchanges}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="monthLabel" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="listingsCount" name="Publicaciones" stroke="#2e7d32" strokeWidth={2} />
                                    <Line type="monotone" dataKey="exchangesCount" name="Intercambios" stroke="#66bb6a" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : <p className="text-center text-gray-400 py-10">No hay datos disponibles</p>}
                    </ChartContainer>
                    <ChartContainer title="Flujo de Créditos" explanation="Comparativa entre créditos comprados (entrada de dinero) y créditos intercambiados (economía interna).">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={[{
                                name: 'Periodo Actual',
                                Comprados: monetizationReport?.creditsPurchasedInPeriod || 0,
                                Intercambiados: monetizationReport?.creditsExchangedInPeriod || 0
                            }]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Comprados" fill="#66bb6a" name="Créditos Comprados" />
                                <Bar dataKey="Intercambiados" fill="#2e7d32" name="Créditos Circulantes" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <ChartContainer title="Ranking Top 10 Usuarios" explanation="Usuarios con mayor participación en el ecosistema.">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2">Usuario</th>
                                        <th className="px-4 py-2 text-center">Trueques</th>
                                        <th className="px-4 py-2 text-right">Puntaje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {advancedReport?.topUsers?.length ? advancedReport.topUsers.map((u, i) => (
                                        <tr key={i} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-4 py-2 font-medium text-gray-900">{u.userName}</td>
                                            <td className="px-4 py-2 text-center">{u.exchangesCount}</td>
                                            <td className="px-4 py-2 text-right font-bold text-green-600">{u.score.toFixed(0)}</td>
                                        </tr>
                                    )) : <tr><td colSpan={3} className="text-center py-4">Sin datos</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </ChartContainer>
                </div>
            </div>

            {/* SECCIÓN 3: CUSTODIA, RECLAMOS E IMPACTO */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-green-primary pl-3">3. Calidad e Impacto</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ChartContainer title="Estado de Reclamos" explanation="Supervisión de conflictos en los trueques.">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={claimsData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {claimsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={Object.values(STATUS_COLORS)[index % 4]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <ChartContainer title="Impacto por Categoría" explanation="Cantidad de artículos reutilizados por categoría.">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={impactReport?.impactByCategory || []} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="categoryName" width={100} style={{ fontSize: '12px' }} />
                                <Tooltip />
                                <Bar dataKey="itemsExchanged" fill="#2e7d32" name="Artículos Reutilizados" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </div>

            {/* SECCIÓN 4: GESTIÓN DE RECLAMOS */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-green-primary pl-3">4. Gestión de Reclamos Activos</h2>
                <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
                    {activeClaims.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Usuario</th>
                                        <th className="px-4 py-3">Tipo</th>
                                        <th className="px-4 py-3">Detalles</th>
                                        <th className="px-4 py-3">Motivo</th>
                                        <th className="px-4 py-3">Fecha</th>
                                        <th className="px-4 py-3 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeClaims.map((claim) => (
                                        <tr key={claim.id} className="bg-white border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">#{claim.id}</td>
                                            <td className="px-4 py-3">{claim.claimantName}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs rounded ${claim.exchangeId ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                    {claim.exchangeId ? 'Intercambio' : 'Publicación'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {claim.exchangeDetails ? (
                                                    <div>
                                                        <div className="font-medium">{claim.exchangeDetails.listingTitle}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {claim.exchangeDetails.buyerName} ↔ {claim.exchangeDetails.sellerName}
                                                        </div>
                                                    </div>
                                                ) : claim.listingDetails ? (
                                                    <div>
                                                        <div className="font-medium">{claim.listingDetails.title}</div>
                                                        <div className="text-xs text-gray-500">Por: {claim.listingDetails.authorName}</div>
                                                    </div>
                                                ) : 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 max-w-xs truncate" title={claim.reason}>
                                                {claim.reason}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500">
                                                {new Date(claim.createdAt).toLocaleDateString('es-ES')}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('¿Marcar este reclamo como resuelto?')) {
                                                            try {
                                                                await api.resolveClaim(claim.id);
                                                                await fetchReports(); // Refresh data
                                                            } catch (err) {
                                                                console.error('Error resolving claim:', err);
                                                                alert('Error al resolver el reclamo');
                                                            }
                                                        }
                                                    }}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                                                >
                                                    Resolver
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-gray-400 py-10">✅ No hay reclamos activos</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Componentes Auxiliares ---

const KpiCard = ({ title, value, icon, explanation, isNegative = false }: any) => (
    <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-primary flex flex-col justify-between hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm font-bold uppercase">{title}</p>
                <h3 className={`text-3xl font-bold mt-1 ${isNegative && value > 0 ? 'text-red-500' : 'text-gray-800'}`}>
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </h3>
            </div>
            <span className="text-3xl opacity-80">{icon}</span>
        </div>
        <p className="text-xs text-gray-400 mt-3 italic border-t pt-2">{explanation}</p>
    </div>
);

const ChartContainer = ({ title, explanation, children }: any) => (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100 flex flex-col h-full">
        <h3 className="text-lg font-bold text-green-dark mb-1">{title}</h3>
        <p className="text-xs text-gray-500 mb-4">{explanation}</p>
        <div className="flex-grow min-h-[300px]">
            {children}
        </div>
    </div>
);

export default AdminPage;