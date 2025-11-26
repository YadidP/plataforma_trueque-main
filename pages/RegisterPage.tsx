import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            addNotification('Las contraseñas no coinciden', 'error');
            return;
        }
        if (password.length < 6) {
            addNotification('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password);
            addNotification('¡Cuenta creada con éxito! Tienes 10 créditos de regalo 🎁', 'success');
            navigate('/dashboard');
        } catch (error: any) {
            console.error(error);
            addNotification(error.response?.data?.message || 'Error al conectar con el servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Lado Izquierdo - Formulario */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Únete a EcoTrade</h2>
                        <p className="mt-2 text-gray-500">Crea tu cuenta gratis y comienza a intercambiar.</p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-green-500 focus:bg-white focus:ring-0 transition-all outline-none"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 block mb-1">Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-green-500 focus:bg-white focus:ring-0 transition-all outline-none"
                                    placeholder="nombre @ejemplo.com"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Contraseña</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-green-500 focus:bg-white focus:ring-0 transition-all outline-none"
                                        placeholder="Min. 6 caracteres"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Repetir Contraseña</label>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-green-500 focus:bg-white focus:ring-0 transition-all outline-none"
                                        placeholder="Confirmar"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creando cuenta...' : 'Registrarse Gratis'}
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/login" className="font-bold text-green-600 hover:text-green-500">
                                Inicia sesión
                            </Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* Lado Derecho - Decorativo */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-800 to-emerald-900 relative overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 max-w-lg text-center p-12 text-white">
                    <div className="mb-8 inline-block bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                        <span className="text-6xl">🌍</span>
                    </div>
                    <h2 className="text-4xl font-bold mb-6">Tu impacto comienza aquí</h2>
                    <p className="text-green-100 text-lg leading-relaxed">
                        "Pequeñas acciones multiplican grandes cambios. Únete a nuestra comunidad y dale una segunda vida a lo que ya no usas."
                    </p>
                    <div className="mt-12 flex justify-center gap-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold">10+</div>
                            <div className="text-xs text-green-300 uppercase tracking-wider">Categorías</div>
                        </div>
                        <div className="w-px bg-white/20 h-12"></div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">0%</div>
                            <div className="text-xs text-green-300 uppercase tracking-wider">Comisión</div>
                        </div>
                        <div className="w-px bg-white/20 h-12"></div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">∞</div>
                            <div className="text-xs text-green-300 uppercase tracking-wider">Impacto</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;