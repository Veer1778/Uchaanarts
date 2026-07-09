import Image from "next/image";

export default function Loader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-5" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-5">
        <div className="relative grid h-16 w-16 place-items-center">
          <span className="absolute inset-0 rounded-full border-2 border-line" />
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-signal" />
          <Image src="/logo.png" alt="" width={129} height={83} className="h-7 w-auto" priority />
        </div>
        <span className="sr-only">{label}…</span>
      </div>
    </div>
  );
}
