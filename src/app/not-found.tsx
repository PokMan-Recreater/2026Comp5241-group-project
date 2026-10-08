import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
        That page has not been written yet
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        The link may be out of date, or it might point at a generated course that only exists in
        another browser profile. Everything you create is stored locally, so nothing is lost.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          Back home
        </Link>
        <Link href="/catalog" className="btn btn-secondary">
          Browse courses
        </Link>
        <Link href="/dashboard" className="btn btn-ghost">
          My dashboard
        </Link>
      </div>
    </div>
  );
}
