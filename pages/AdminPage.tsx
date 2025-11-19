import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import * as api from '../services/api';
import { UserReport, MonetizationReport, ImpactReport, ClaimsReport, AdvancedReport } from '../types';
import Spinner from '../components/Spinner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#2e7d32', '#66bb6a', '#81c784', '#a5d6a7', '#c8e6c9'];
const RED_COLORS = ['#ef5350', '#e57373'];

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    // Estados de Datos
    const [userReport, setUserReport] = useState<UserReport | null>(null);
    const [monetizationReport, setMonetizationReport] = useState<MonetizationReport | null>(null);
    const [impactReport, setImpactReport] = useState<ImpactReport | null>(null);
    const [claimsReport, setClaimsReport] = useState<ClaimsReport | null>(null);
    const [advancedReport, setAdvancedReport] = useState<AdvancedReport | null>(null);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const params = { startDate: dateRange.startDate, endDate: dateRange.endDate };
            const [users, monetization, impact, claims, advanced] = await Promise.all([
                api.getUsersReport(params),
                api.getMonetizationReport(params),
                api.getImpactReport(params),
                api.getClaimsReport(params),
                api.getAdvancedReport(),
            ]);
            setUserReport(users);
            setMonetizationReport(monetization);
            setImpactReport(impact);
            setClaimsReport(claims);
            setAdvancedReport(advanced);
        } catch (err) {
            console.error(err);
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
        pdf.addImage(imgData, 'PNG', 10, 10, 280, (canvas.height * 280) / canvas.width);
        pdf.save('reporte_ejecutivo.pdf');
    };

    if (loading) return <Spinner />;

    return (
        <div className="max-w-7xl mx-auto pb-12" id="admin-dashboard-content">
            {/* Encabezado */}
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <div>
                    <h1 className="text-4xl font-bold text-green-dark">Tablero de Control Ejecutivo</h1>
                    <p className="text-gray-600">Monitorización estratégica de uso, crecimiento y monetización.</p>
                </div>
                <div className="flex gap-4">
                    <input type="date" value={dateRange.startDate} onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })} className="border rounded px-2" />
                    <input type="date" value={dateRange.endDate} onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })} className="border rounded px-2" />
                    <button onClick={fetchReports} className="bg-green-primary text-white px-4 rounded hover:bg-green-dark">Filtrar</button>
                    <button onClick={generatePDF} className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700">PDF</button>
                </div>
            </div>

            {/* Navegación */}
            <div className="flex space-x-4 mb-6">
                {['overview', 'growth', 'monetization', 'impact'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg font-semibold capitalize ${activeTab === tab ? 'bg-green-100 text-green-800 border-2 border-green-500' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        {tab === 'overview' ? 'Resumen General' : tab === 'growth' ? 'Uso y Crecimiento' : tab === 'monetization' ? 'Monetización' : 'Impacto'}
                    </button>
                ))}
            </div>

            {/* CONTENIDO */}
            <div className="space-y-8">

                {/* --- TAB: RESUMEN GENERAL --- */}
                {activeTab === 'overview' && userReport && monetizationReport && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <KpiCard
                                title="Usuarios Activos (30d)"
                                value={userReport.activeUsersInPeriod}
                                target={100}
                                explanation="Usuarios con transacciones o login en los últimos 30 días. Indica vitalidad de la plataforma."
                            />
                            <KpiCard
                                title="Ingresos del Periodo"
                                value={`${monetizationReport.revenueInPeriod} Bs`}
                                target={500}
                                explanation="Dinero real recaudado por venta de créditos en el periodo seleccionado."
                            />
                            <KpiCard
                                title="Intercambios Totales"
                                value={monetizationReport.exchangesInPeriod}
                                target={50}
                                explanation="Número de transacciones exitosas. Refleja la liquidez del mercado."
                            />
                            <KpiCard
                                title="Conversión a Premium"
                                value="12%"
                                target={15}
                                explanation="% de usuarios que compran créditos vs total de usuarios."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ChartContainer title="Ranking Top 10 Usuarios" explanation="Usuarios con mayor puntaje basado en intercambios y créditos generados.">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-500">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2">Usuario</th>
                                                <th className="px-4 py-2 text-center">Intercambios</th>
                                                <th className="px-4 py-2 text-right">Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {advancedReport?.topUsers.map((u, i) => (
                                                <tr key={i} className="bg-white border-b hover:bg-gray-50">
                                                    <td className="px-4 py-2 font-medium text-gray-900">{u.userName}</td>
                                                    <td className="px-4 py-2 text-center">{u.exchangesCount}</td>
                                                    <td className="px-4 py-2 text-right font-bold text-green-600">{u.score.toFixed(1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </ChartContainer>

                            <ChartContainer title="Ratio Publicaciones vs Intercambios" explanation="Mide la eficiencia del mercado. Un ratio bajo indica poca demanda o mala calidad de listings.">
                                <div className="flex flex-col items-center justify-center h-full">
                                    <div className="text-6xl font-bold text-blue-600 mb-2">
                                        {((monetizationReport.exchangesInPeriod / (userReport.totalUsers * 2 || 1)) * 100).toFixed(1)}%
                                    </div>
                                    <p className="text-gray-500 text-center">Eficiencia de Mercado Estimada</p>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Objetivo: &gt;50%</p>
                                </div>
                            </ChartContainer>
                        </div>
                    </>
                )}

                {/* --- TAB: USO Y CRECIMIENTO --- */}
                {activeTab === 'growth' && advancedReport && userReport && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ChartContainer title="Tendencia: Nuevos vs Abandonos" explanation="Comparativa mensual. Si la línea roja supera a la verde, estamos perdiendo base de usuarios.">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={advancedReport.trends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="monthLabel" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="newUsers" name="Nuevos" stroke="#2e7d32" strokeWidth={2} />
                                        <Line type="monotone" dataKey="churnedUsers" name="Abandonos" stroke="#ef5350" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>

                            <ChartContainer title="Usuarios Activos Mensuales (MAU)" explanation="Evolución de usuarios que realizaron al menos una acción en el mes.">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={advancedReport.trends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="monthLabel" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="activeUsers" name="Usuarios Activos" fill="#66bb6a" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <KpiCard title="Total Usuarios Histórico" value={userReport.totalUsers} explanation="Base de datos total de registros." />
                            <KpiCard title="Nuevos (Periodo Seleccionado)" value={userReport.newUsersInPeriod} explanation="Captación reciente." />
                            <KpiCard title="Tasa de Abandono Global" value={`${((userReport.inactiveUsers / userReport.totalUsers) * 100).toFixed(1)}%`} explanation="% usuarios inactivos > 60 días." isNegative />
                        </div>
                    </>
                )}

                {/* --- TAB: MONETIZACIÓN --- */}
                {activeTab === 'monetization' && advancedReport && monetizationReport && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ChartContainer title="Ingresos Mensuales (Bs)" explanation="Tendencia de recaudación por venta de paquetes de créditos.">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={advancedReport.trends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="monthLabel" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="revenue" name="Ingresos (Bs)" stroke="#2e7d32" activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>

                            <ChartContainer title="Consumo vs Generación de Créditos" explanation="Equilibrio económico. Si la generación supera por mucho al consumo, habrá inflación de créditos.">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={[{
                                        name: 'Periodo Actual',
                                        Generados: monetizationReport.creditsPurchasedInPeriod, // Simplificación para el ejemplo
                                        Consumidos: monetizationReport.creditsExchangedInPeriod
                                    }]}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="Generados" fill="#81c784" />
                                        <Bar dataKey="Consumidos" fill="#2e7d32" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <KpiCard title="Créditos Comprados" value={monetizationReport.creditsPurchasedInPeriod} explanation="Volumen de moneda virtual inyectada." />
                            <KpiCard title="Créditos Intercambiados" value={monetizationReport.creditsExchangedInPeriod} explanation="Volumen de moneda virtual circulante." />
                            <KpiCard title="Ticket Promedio" value={`${(monetizationReport.revenueInPeriod / (monetizationReport.exchangesInPeriod || 1)).toFixed(2)} Bs`} explanation="Ingreso promedio por intercambio realizado." />
                        </div>
                    </>
                )}

                {/* --- TAB: IMPACTO --- */}
                {activeTab === 'impact' && impactReport && (
                    <>
                        <div className="grid grid-cols-1 gap-8">
                            <ChartContainer title="Intercambios por Categoría" explanation="Ayuda a identificar nichos de mercado y categorías más populares.">
                                <ResponsiveContainer width="100%" height={400}>
                                    <BarChart data={impactReport.impactByCategory} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis type="category" dataKey="categoryName" width={150} />
                                        <Tooltip />
                                        <Bar dataKey="itemsExchanged" fill="#2e7d32" name="Items Intercambiados" radius={[0, 4, 4, 0]}>
                                            {impactReport.impactByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Componentes Auxiliares ---

const KpiCard = ({ title, value, target, explanation, isNegative = false }: any) => {
    const isNumber = typeof value === 'number';
    const numericValue = isNumber ? value : parseFloat(value as string);
    const statusColor = target ? (numericValue >= target ? 'text-green-600' : 'text-yellow-600') : (isNegative ? 'text-red-600' : 'text-green-600');

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 flex flex-col justify-between h-full">
            <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">{title}</h3>
                <div className="flex items-end gap-2">
                    <span className={`text-3xl font-bold ${statusColor}`}>{value}</span>
                    {target && <span className="text-xs text-gray-400 mb-1">Meta: {target}</span>}
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 italic">
                    <span className="font-bold">Interpretación:</span> {explanation}
                </p>
            </div>
        </div>
    );
};

const ChartContainer = ({ title, explanation, children }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h3 className="text-lg font-bold text-green-dark mb-4">{title}</h3>
        <div className="mb-4">{children}</div>
        <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
            <p className="text-xs text-blue-800">
                <strong>Qué significa:</strong> {explanation}
            </p>
        </div>
    </div>
);

export default AdminPage;