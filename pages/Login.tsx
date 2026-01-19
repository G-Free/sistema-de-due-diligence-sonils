import React, { useState } from "react";
import { MailIcon } from "../components/icons/MailIcon";
import { LockIcon } from "../components/icons/LockIcon";

interface LoginProps {
  onLogin: (email: string, pass: string) => boolean;
}

const sonilsLogoBase64 = "components/image/SONILS_login.png";

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = onLogin(email, password);
    if (!success) {
      setError("Email ou senha inválidos. Por favor, tente novamente.");
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-text-main">
      {/* Painel Esquerdo - Branding */}
      <div
        className="hidden lg:flex w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: `url('../components/image/solocompliance.png')`,
        }}
      >
        <div className="bg-primary/90 w-full h-full flex flex-col justify-between p-12 text-white">
          <div>
            <img src={sonilsLogoBase64} alt="SONILS Logo" className="h-12" />
          </div>
          <div>
            <h1 className="text-4xl font-bold leading-tight">
              Plataforma Integrada de Due Diligence
            </h1>
            <p className="mt-4 text-lg text-gray-200">
              Gestão de Risco de Terceiros, simplificada e inteligente.
            </p>
          </div>
          <p className="text-sm text-gray-300">
            © {new Date().getFullYear()} SONILS, S.A. Todos os direitos
            reservados.
          </p>
        </div>
      </div>

      {/* Painel Direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-card p-8 rounded-2xl shadow-xl">
          <div className="lg:hidden text-center mb-8">
            <img
              src={sonilsLogoBase64}
              alt="SONILS Logo"
              className="h-16 w-auto mx-auto mb-4"
            />
          </div>
          <h2 className="text-3xl font-bold text-primary text-center lg:text-left">
            Bem-vindo de volta
          </h2>
          <p className="mt-2 text-text-secondary text-center lg:text-left">
            Aceda à sua conta para continuar.
          </p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email-address"
                className="block text-sm font-medium text-text-secondary"
              >
                Endereço de email
              </label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <MailIcon className="h-5 w-5 text-text-secondary" />
                </span>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-3 pl-10 border border-border bg-background rounded-lg placeholder-text-secondary text-text-main focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-secondary focus:border-secondary sm:text-sm transition"
                  placeholder="seu.email@sonils.co.ao"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-secondary"
              >
                Senha
              </label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockIcon className="h-5 w-5 text-text-secondary" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-3 pl-10 border border-border bg-background rounded-lg placeholder-text-secondary text-text-main focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-secondary focus:border-secondary sm:text-sm transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 rounded-md text-center animate-fade-in">
                <p className="text-sm font-medium text-danger">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-primary bg-secondary hover:bg-secondary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
              >
                Entrar
              </button>
            </div>
          </form>
          <div className="text-center text-xs text-text-secondary mt-6">
            <p>
              Para demonstração, use qualquer um dos utilizadores definidos com
              a senha: <strong className="text-text-main">sonils2024</strong>
            </p>
            <p className="mt-1">(Ex: admin@sonils.co.ao)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
