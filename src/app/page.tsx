import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f4] px-4 py-8 text-[#1d1d1b]">
      <section className="grid w-full max-w-[520px] gap-5">
        <p className="m-0 text-[16px] leading-[1.5] text-[#55554d]">App Ingreso</p>
        <h1 className="m-0 text-[40px] leading-[1.1] font-bold">Seguimiento de practica</h1>
        <Link
          href="/dashboard"
          className="inline-flex h-12 w-fit items-center justify-center rounded-[8px] bg-[#1d1d1b] px-5 text-[16px] font-semibold text-white"
        >
          Dashboard
        </Link>
      </section>
    </main>
  );
}
