export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md text-center">
        <p className="text-8xl font-bold tracking-tight text-gray-900">
          404
        </p>

        <h1 className="mt-4 text-2xl font-semibold text-gray-900">
          Página no encontrada
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Lo sentimos, la página que estás buscando no existe o ya no está
          disponible.
        </p>

        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Volver
          </button>

          <a
            href="/"
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </main>
  );
}
