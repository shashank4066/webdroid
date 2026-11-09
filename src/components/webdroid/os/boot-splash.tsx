'use client';

/** Android-style cold boot animation: glowing orb, wordmark, boot bar. */
export function BootSplash() {
  return (
    <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="wd-orb absolute h-14 w-14 rounded-full bg-emerald-500/90 blur-md" />
        <span className="absolute h-10 w-10 rounded-full bg-emerald-400" />
        <span className="absolute h-10 w-10 rounded-full bg-white/80 opacity-20 blur-[2px]" />
      </div>
      <div className="mt-7 text-[15px] font-medium tracking-[0.42em] text-emerald-300">
        webdroid
      </div>
      <div className="mt-2 text-[9px] uppercase tracking-[0.3em] text-zinc-500">
        android · webassembly
      </div>
      <div className="mt-10 h-[3px] w-44 overflow-hidden rounded-full bg-zinc-800">
        <div className="wd-bootbar h-full rounded-full bg-emerald-400" />
      </div>
    </div>
  );
}
