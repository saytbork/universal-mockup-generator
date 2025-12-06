import { useState, useRef, useEffect, ReactNode } from "react";

export function Accordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [open]);

  return (
    <div className="border-b border-gray-700">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-3 text-left font-semibold text-gray-200 hover:bg-gray-700/50"
      >
        <span>{title}</span>
      </button>

      <div
        className="transition-all duration-300 overflow-hidden"
        style={{ maxHeight: open ? height : 0 }}
      >
        <div ref={contentRef} className="pb-4 px-2">
          {children}
        </div>
      </div>
    </div>
  );
}
