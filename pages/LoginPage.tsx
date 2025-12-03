// ... imports ...
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const { addNotification } = useNotification();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            addNotification('Sesión iniciada correctamente', 'success');
            navigate('/dashboard');
        } catch (error: any) {
            // Manejo específico para baneo (403 Forbidden)
            if (error.response && error.response.status === 403 && error.response.data.until) {
                navigate('/banned', { 
                    state: { 
                        reason: error.response.data.reason, 
                        until: error.response.data.until 
                    } 
                });
            } else {
                addNotification(error.response?.data?.message || 'Error al iniciar sesión', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Lado Izquierdo - Decorativo */}
            <div className="hidden lg:flex w-1/2 bg-green-900 items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="z-10 text-white p-12">
                    <h1 className="text-5xl font-bold mb-6">EcoTrade</h1>
                    <p className="text-xl text-green-100">Únete a la revolución de la economía circular. Intercambia, ahorra y ayuda al planeta.</p>
                </div>
            </div>
            {/* Lado Derecho - Formulario */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Hola de nuevo! 👋</h2>
                    <p className="text-gray-500 mb-8">Ingresa tus credenciales para continuar.</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                placeholder="••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl font-bold transition-colors disabled:bg-gray-400"
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            ¿No tienes una cuenta?{' '}
                            <Link to="/register" className="text-green-600 hover:underline font-semibold">
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default LoginPage;