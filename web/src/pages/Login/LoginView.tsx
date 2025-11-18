import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Mail, User } from 'lucide-react';
import { useEffect } from 'react';
import { ErrorMessage } from '../../components/ErrorMessage';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface LoginViewProps {
    onLogin: (e: React.FormEvent) => void;
    onRegister: (e: React.FormEvent) => void;
    onToggleRegisterMode: () => void;
    error: string | null;
    email: string;
    password: string;
    isRegister: boolean;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    loading: boolean;
}

export function LoginView({
    onLogin,
    onRegister,
    onToggleRegisterMode,
    error,
    email,
    password,
    isRegister,
    setEmail,
    setPassword,
    loading
}: LoginViewProps) {

    useEffect(() => {
        const container = document.querySelector('.login-container');
        if (!container) return;
        if (isRegister) {
            container.classList.add('sign-up-mode');
        } else {
            container.classList.remove('sign-up-mode');
        }
    }, [isRegister]);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen flex items-center justify-center p-5 login-page">
            <div className="login-container relative w-full max-w-[900px] h-[550px] bg-background rounded-[20px] shadow-2xl overflow-hidden">
                {/* Forms Container */}
                <div className="forms-container absolute w-full h-full top-0 left-0">
                    <div className="signin-signup absolute top-1/2 left-3/4 w-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out delay-700 grid grid-cols-1 z-[10]">

                        {/* Sign In Form */}
                        <form
                            className="sign-in-form flex items-center justify-center flex-col px-20 transition-all duration-200 delay-700 overflow-hidden col-start-1 col-end-2 row-start-1 row-end-2 z-[2]"
                            onSubmit={onLogin}
                        >
                            <h2 className="title text-4xl text-foreground mb-3 font-bold">Iniciar sesión</h2>

                            <div className="input-field max-w-[380px] w-full bg-muted/50 my-2.5 h-[55px] rounded-[55px] grid grid-cols-[15%_85%] px-2 relative transition-all duration-300 focus-within:bg-muted focus-within:ring-2 focus-within:ring-ring">
                                <div className="flex items-center justify-center text-muted-foreground">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <Input
                                    type="email"
                                    placeholder="Correo electrónico"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-transparent border-0 shadow-none h-full focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>

                            <div className="input-field max-w-[380px] w-full bg-muted/50 my-2.5 h-[55px] rounded-[55px] grid grid-cols-[15%_85%] px-2 relative transition-all duration-300 focus-within:bg-muted focus-within:ring-2 focus-within:ring-ring">
                                <div className="flex items-center justify-center text-muted-foreground">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <Input
                                    type="password"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-transparent border-0 shadow-none h-full focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>

                            {error && <ErrorMessage error={error} className="my-2 max-w-[380px] w-full" />}

                            <Button
                                type="submit"
                                className="w-[150px] h-[49px] rounded-[49px] uppercase font-semibold my-2.5 text-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                Entrar
                            </Button>
                        </form>

                        {/* Sign Up Form */}
                        <form
                            className="sign-up-form flex items-center justify-center flex-col px-20 transition-all duration-200 delay-700 overflow-hidden col-start-1 col-end-2 row-start-1 row-end-2 opacity-0 z-[1]"
                            onSubmit={onRegister}
                        >
                            <h2 className="title text-4xl text-foreground mb-3 font-bold">Registrarse</h2>

                            <div className="input-field max-w-[380px] w-full bg-muted/50 my-2.5 h-[55px] rounded-[55px] grid grid-cols-[15%_85%] px-2 relative transition-all duration-300 focus-within:bg-muted focus-within:ring-2 focus-within:ring-ring">
                                <div className="flex items-center justify-center text-muted-foreground">
                                    <User className="w-5 h-5" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Nombre de usuario"
                                    className="bg-transparent border-0 shadow-none h-full focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>

                            <div className="input-field max-w-[380px] w-full bg-muted/50 my-2.5 h-[55px] rounded-[55px] grid grid-cols-[15%_85%] px-2 relative transition-all duration-300 focus-within:bg-muted focus-within:ring-2 focus-within:ring-ring">
                                <div className="flex items-center justify-center text-muted-foreground">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <Input
                                    type="email"
                                    placeholder="Correo electrónico"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-transparent border-0 shadow-none h-full focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>

                            <div className="input-field max-w-[380px] w-full bg-muted/50 my-2.5 h-[55px] rounded-[55px] grid grid-cols-[15%_85%] px-2 relative transition-all duration-300 focus-within:bg-muted focus-within:ring-2 focus-within:ring-ring">
                                <div className="flex items-center justify-center text-muted-foreground">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <Input
                                    type="password"
                                    placeholder="Contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-transparent border-0 shadow-none h-full focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>

                            {error && <ErrorMessage error={error} className="my-2 max-w-[380px] w-full" />}

                            <Button
                                type="submit"
                                className="w-[150px] h-[49px] rounded-[49px] uppercase font-semibold my-2.5 text-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lg"
                            >
                                Registrarse
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Panels Container */}
                <div className="panels-container absolute h-full w-full top-0 left-0 grid grid-cols-2">
                    {/* Left Panel */}
                    <div className="panel left-panel flex flex-col items-end justify-around text-center z-[6] pointer-events-auto px-[12%] py-12">
                        <div className="content text-primary-foreground transition-transform duration-900 ease-in-out delay-600">
                            <h3 className="font-semibold text-2xl mb-2.5">¿Nuevo aquí?</h3>
                            <p className="text-sm py-3 px-0">
                                Únete hoy y descubre un mundo de posibilidades. ¡Crea tu cuenta en segundos!
                            </p>
                            <Button
                                variant="outline"
                                onClick={onToggleRegisterMode}
                                className="mt-0 bg-transparent border-2 border-primary-foreground text-primary-foreground w-[130px] h-[41px] font-semibold text-xs hover:bg-primary-foreground/10 hover:-translate-y-0.5"
                            >
                                Registrarse
                            </Button>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="panel right-panel flex flex-col items-end justify-around text-center z-[6] pointer-events-none px-[12%] py-12">
                        <div className="content text-primary-foreground transition-transform duration-900 ease-in-out delay-600">
                            <h3 className="font-semibold text-2xl mb-2.5">¿Ya tienes cuenta?</h3>
                            <p className="text-sm py-3 px-0">
                                ¡Bienvenido de vuelta! Inicia sesión para continuar tu viaje con nosotros.
                            </p>
                            <Button
                                variant="outline"
                                onClick={onToggleRegisterMode}
                                className="mt-0 bg-transparent border-2 border-primary-foreground text-primary-foreground w-[130px] h-[41px] font-semibold text-xs hover:bg-primary-foreground/10 hover:-translate-y-0.5"
                            >
                                Iniciar sesión
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Animated Circle Background */}
                <div className="login-circle absolute h-[2000px] w-[2000px] -top-[10%] right-[48%] bg-gradient-to-br from-primary to-primary/80 transition-all duration-[1800ms] ease-in-out rounded-full z-[1] pointer-events-none" />
            </div>
        </div>
    );
}
