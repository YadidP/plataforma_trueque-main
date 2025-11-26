const openListModal = async (type: 'users' | 'finance' | 'listings' | 'exchanges') => {
    setModalType(type);
    setModalOpen(true);
    setListLoading(true);
    try {
        let data = [];
        if (type === 'users') data = await api.getAdminUsersList();
        if (type === 'finance') data = await api.getAdminFinanceList();
        if (type === 'listings') data = await api.getAdminListingsList();
        if (type === 'exchanges') data = await api.getAdminExchangesList();
        setListData(data);
    } catch (e) {
        console.error(e);
    } finally {
        setListLoading(false);
    }
};

// Exportar PDF
const generatePDF = async () => {
    const element = document.getElementById('admin-dashboard');
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`reporte_admin_${dateRange.endDate}.pdf`);
};

// Colores para gráficos
const PIE_COLORS = ['#4ade80', '#3b82f6', '#9ca3af']; // Verde (Nuevos), Azul (Activos), Gris (Inactivos)

if (loading) return <Spinner />;

return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto" id="admin-dashboard">

            {/* Header Admin */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Panel de Administración</h1>
                    <p className="text-gray-500">Módulo 1: Indicadores & Módulo 2: Dinámica</p>
                </div>

                {/* Filtros */}
                <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex flex-wrap items-center gap-2">
                    <input
                        type="date"
                        value={dateRange.startDate}
                        onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
                        className="border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
                    />
                    <span className="text-gray-400">→</span>
                    <input
                        type="date"
                        value={dateRange.endDate}
                        onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
                        className="border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500"
                    />
                    <button
                        onClick={fetchAllData}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                        Filtrar
                    </button>
                    <button
                        onClick={generatePDF}
                        className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                    >
                        <span>📄</span> PDF
                    </button>
                </div>
            </div>

            {/* GRID DE KPIs (MÓDULO 1) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

                {/* KPI 1: Usuarios */}
                <KpiCard
                    title="Usuarios Totales"
                    value={kpiData?.users?.total_users}
                    icon="👥"
                    color="blue"
                    onClick={() => openListModal('users')}
                >
                    <div className="mt-3 pt-3 border-t border-blue-100 text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between"><span>Nuevos (periodo):</span> <span className="font-bold">{kpiData?.users?.new_users}</span></div>
                        <div className="flex justify-between"><span>Gratuitos:</span> <span className="font-bold">{kpiData?.users?.users_free}</span></div>
                        <div className="flex justify-between"><span>Eco-Pro:</span> <span className="font-bold text-blue-600">{kpiData?.users?.users_pro}</span></div>
                        <div className="flex justify-between"><span>Eco-Leader:</span> <span className="font-bold text-yellow-600">{kpiData?.users?.users_leader}</span></div>
                    </div>
                </KpiCard>

                {/* KPI 2: Ingresos */}
                <KpiCard
                    title="Ingresos Totales"
                    value={`${kpiData?.revenue?.total_revenue} Bs`}
                    icon="💰"
                    color="green"
                    onClick={() => openListModal('finance')}
                >
                    <div className="mt-3 pt-3 border-t border-green-100 text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between"><span>Por Créditos:</span> <span className="font-bold">{kpiData?.revenue?.revenue_credits} Bs</span></div>
                        <div className="flex justify-between"><span>Por Suscripciones:</span> <span className="font-bold">{kpiData?.revenue?.revenue_subscriptions} Bs</span></div>
                    </div>
                </KpiCard>

                {/* KPI 3: Publicaciones */}
                <KpiCard
                    title="Publicaciones"
                    value={kpiData?.operations?.total_listings}
                    icon="📦"
                    color="purple"
                    onClick={() => openListModal('listings')}
                >
                    <div className="mt-3 pt-3 border-t border-purple-100 text-xs text-gray-500">
                        Total de artículos publicados en el periodo seleccionado.
                    </div>
                </KpiCard>

                {/* KPI 4: Intercambios */}
                <KpiCard
                    title="Intercambios"
                    value={kpiData?.operations?.total_exchanges}
                    icon="🤝"
                    color="orange"
                    onClick={() => openListModal('exchanges')}
                >
                    <div className="mt-3 pt-3 border-t border-orange-100 text-xs text-gray-600">
                        <div className="flex justify-between"><span>Volumen Artículos:</span> <span className="font-bold">{kpiData?.operations?.exchanged_volume}</span></div>
                    </div>
                </KpiCard>

            </div>

            {/* MÓDULO 2: DINÁMICA DE USUARIOS */}
            <div className="mb-10">
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-sm">2</span>
                        Dinámica de Usuarios
                    </h2>

                    {/* Filtro de Rol específico para esta sección */}
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="border-gray-300 rounded-lg text-sm p-2 bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="ALL">Todos los Roles</option>
                        <option value="usuario">Usuario Común</option>
                        <option value="emprendedor">Emprendedor</option>
                        <option value="admin">Administrador</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Gráfico 1: Flujo (Nuevos vs Activos) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                        <h3 className="font-bold text-gray-700 mb-4">Flujo de Actividad Mensual</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dynamicsData?.flow || []}>
                                    <defs>
                                        <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month_label" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="new_users" name="Nuevos Registros" stroke="#4ade80" fillOpacity={1} fill="url(#colorNew)" />
                                    <Area type="monotone" dataKey="active_users" name="Usuarios Activos" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActive)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gráfico 2: Distribución (Torta) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-700 mb-4 text-center">Estado de Usuarios ({roleFilter})</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={dynamicsData?.distribution || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        nameKey="status"
                                    >
                                        {(dynamicsData?.distribution || []).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gráfico 3: Crecimiento (Barras + Línea) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-3">
                        <h3 className="font-bold text-gray-700 mb-4">Tasa de Crecimiento Total</h3>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={dynamicsData?.growth || []}>
                                    <CartesianGrid stroke="#f5f5f5" />
                                    <XAxis dataKey="month_label" />
                                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#ff7300" unit="%" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="total_users" name="Total Usuarios" barSize={20} fill="#413ea0" />
                                    <Line yAxisId="right" type="monotone" dataKey="growth_rate" name="Crecimiento %" stroke="#ff7300" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>

            {/* Próximos módulos placeholder */}
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400">
                Módulos de Economía y Impacto se cargarán aquí en la siguiente etapa.
            </div>

        </div>

        {/* MODAL DE DETALLES (Reutilizable) */}
        {modalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                        <h3 className="text-xl font-bold text-gray-800 capitalize">Detalle de {modalType}</h3>
                        <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>

                    <div className="flex-1 overflow-auto p-6">
                        {listLoading ? <div className="text-center py-10">Cargando datos...</div> : (
                            <DataTable type={modalType} data={listData} />
                        )}
                    </div>

                    <div className="p-4 border-t border-gray-100 text-right">
                        <button onClick={() => setModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300">Cerrar</button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
};

// Componentes Auxiliares Locales

const KpiCard = ({ title, value, icon, color, children, onClick }: any) => {
    const colors: any = {
        blue: 'bg-blue-50 border-blue-100 text-blue-600',
        green: 'bg-green-50 border-green-100 text-green-600',
        purple: 'bg-purple-50 border-purple-100 text-purple-600',
        orange: 'bg-orange-50 border-orange-100 text-orange-600',
    };

    return (
        <div className={`relative p-6 rounded-2xl border-2 ${colors[color]} hover:shadow-lg transition-shadow bg-white`}>
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
                    <h3 className="text-3xl font-extrabold text-gray-800 mt-1">{value}</h3>
                </div>
                <span className="text-3xl">{icon}</span>
            </div>
            {children}
            <button
                onClick={onClick}
                className="mt-4 w-full py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
                Ver Lista Detallada
            </button>
        </div>
    );
};

const DataTable = ({ type, data }: { type: string | null, data: any[] }) => {
    if (!data || data.length === 0) return <p className="text-center text-gray-500">No hay datos para mostrar.</p>;

    let columns = [];
    if (type === 'users') columns = ['ID', 'Nombre', 'Email', 'Rol', 'Plan', 'Saldo', 'Registro'];
    if (type === 'finance') columns = ['Fecha', 'Usuario', 'Tipo', 'Monto (Bs)', 'Ref'];
    if (type === 'listings') columns = ['Producto', 'Autor', 'Categoría', 'Créditos', 'Fecha'];
    if (type === 'exchanges') columns = ['Fecha', 'Producto', 'Comprador', 'Vendedor', 'Total'];

    return (
        <table className="w-full text-left border-collapse text-sm">
            <thead>
                <tr className="bg-gray-100">
                    {columns.map((col, i) => <th key={i} className="p-3 font-bold text-gray-600 border-b border-gray-200">{col}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        {type === 'users' && (
                            <>
                                <td className="p-3">{row.id}</td>
                                <td className="p-3 font-medium">{row.name}</td>
                                <td className="p-3 text-gray-500">{row.email}</td>
                                <td className="p-3"><span className="bg-gray-200 px-2 py-1 rounded text-xs">{row.role}</span></td>
                                <td className="p-3">{row.plan_name}</td>
                                <td className="p-3 font-bold text-green-600">{row.wallet_balance}</td>
                                <td className="p-3 text-xs text-gray-400">{new Date(row.created_at).toLocaleDateString()}</td>
                            </>
                        )}
                        {type === 'finance' && (
                            <>
                                <td className="p-3">{new Date(row.purchase_date).toLocaleDateString()}</td>
                                <td className="p-3">{row.user_name}</td>
                                <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${row.type.includes('Suscripción') ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{row.type}</span></td>
                                <td className="p-3 font-bold">{row.amount_bs}</td>
                                <td className="p-3 text-xs font-mono">{row.payment_ref}</td>
                            </>
                        )}
                        {type === 'listings' && (
                            <>
                                <td className="p-3 font-medium">{row.title}</td>
                                <td className="p-3">{row.author}</td>
                                <td className="p-3">{row.category}</td>
                                <td className="p-3">{row.unit_credits}</td>
                                <td className="p-3 text-xs">{new Date(row.created_at).toLocaleDateString()}</td>
                            </>
                        )}
                        {type === 'exchanges' && (
                            <>
                                <td className="p-3 text-xs">{new Date(row.date).toLocaleDateString()}</td>
                                <td className="p-3 font-medium">{row.product}</td>
                                <td className="p-3 text-blue-600">{row.buyer}</td>
                                <td className="p-3 text-orange-600">{row.seller}</td>
                                <td className="p-3 font-bold text-green-600">{row.totalCredits}</td>
                            </>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default AdminPage;