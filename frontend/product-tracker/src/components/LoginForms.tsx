export default function LoginForm(){
    return (
        <form className="mx-auto flex w-full max-w-md flex-col rounded-xl border border-gray-200 bg-white p-8 shadow-sm gap-3">
            <div>
                <h2 className="text-2x1 text-center font-bold text-gray-900">
                    Iniciar sesion
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor="username">
                        Nombre
                    </label>

                    <input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Nombre de usuario"
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        autoComplete="username"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label 
                        htmlFor="password"
                        className="text-sm font-medium text-gray-700"
                    >
                        Contraseña
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        autoComplete="current-password"
                    />
                </div>

            </div>
            
            <button
                type="submit"
                className="mt-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Ingresar
            </button>
        </form>
    )
}