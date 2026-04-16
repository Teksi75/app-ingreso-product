import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f4] px-4 py-8 text-[#1d1d1b]">
      <section className="grid w-full max-w-[560px] gap-5">
        <p className="m-0 text-[16px] leading-[1.5] text-[#55554d]">App Ingreso</p>
        <h1 className="m-0 text-[40px] leading-[1.1] font-bold">Practica de ingreso</h1>
        <p className="m-0 text-[16px] leading-6 text-[#55554d]">
          Empeza una sesion corta o revisa el progreso guardado.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/practice"
            className="inline-flex h-12 items-center justify-center rounded-[8px] bg-[#1d1d1b] px-5 text-[16px] font-semibold text-white"
          >
            Continuar entrenamiento
          </Link>
          <Link
            href="/practice?newStudent=1"
            className="inline-flex h-12 items-center justify-center rounded-[8px] border border-[#1d1d1b] px-5 text-[16px] font-semibold text-[#1d1d1b]"
          >
            Simular alumno nuevo
          </Link>
        </div>
        <Link
          href="/dashboard"
          className="w-fit text-[15px] font-semibold text-[#55554d] underline underline-offset-4"
        >
          Ver progreso
        </Link>
      </section>
    </main>
  );
}
