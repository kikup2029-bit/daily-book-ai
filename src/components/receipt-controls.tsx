import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Trash2 } from "lucide-react";

import { attachReceipt } from "@/lib/books.functions";
import { deleteReceipt, getReceiptUrl, uploadReceipt } from "@/lib/receipts";
import { Button } from "@/components/ui/button";

export function ReceiptThumb({ path, alt = "Receipt photo" }: { path: string; alt?: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getReceiptUrl(path)
      .then((signed) => {
        if (active) setUrl(signed);
      })
      .catch(() => {
        if (active) setUrl(null);
      });
    return () => {
      active = false;
    };
  }, [path]);

  if (!url) {
    return (
      <span
        className="skeleton block size-10 shrink-0 rounded-[var(--radius-10)]"
        aria-hidden="true"
      />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={[
        "block size-10 shrink-0 overflow-hidden rounded-[var(--radius-10)]",
        "border border-border bg-surface-2",
        "transition-[border-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease)]",
        "hover:border-border-strong hover:shadow-[var(--shadow-sm)]",
      ].join(" ")}
      title="View receipt"
    >
      <img src={url} alt={alt} loading="lazy" className="size-full object-cover" />
    </a>
  );
}

export function ReceiptAttachButton({
  entryId,
  currentPath,
}: {
  entryId: string;
  currentPath: string | null;
}) {
  const queryClient = useQueryClient();
  const save = useServerFn(attachReceipt);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const path = await uploadReceipt(file, entryId);
      await save({ data: { entry_id: entryId, receipt_path: path } });
      if (currentPath) await deleteReceipt(currentPath);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["entries"] }),
    onError: (err: Error) => setError(err.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      await save({ data: { entry_id: entryId, receipt_path: null } });
      if (currentPath) await deleteReceipt(currentPath);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["entries"] }),
    onError: (err: Error) => setError(err.message),
  });

  const busy = upload.isPending || remove.isPending;

  return (
    // Sits inside a row of text, so everything here stays inline-level.
    <span className="inline-flex items-center gap-0.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          setError(null);
          upload.mutate(file);
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        loading={busy}
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        aria-label={currentPath ? "Replace receipt photo" : "Add receipt photo"}
        title={currentPath ? "Replace receipt photo" : "Add receipt photo"}
      >
        {busy ? null : <Camera className="size-4" aria-hidden="true" />}
      </Button>
      {currentPath ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="hover:text-danger"
          disabled={busy}
          onClick={() => remove.mutate()}
          aria-label="Remove receipt photo"
          title="Remove receipt photo"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      ) : null}
      {error ? (
        <span
          role="alert"
          className="rounded-[var(--radius-8)] bg-danger-soft px-1.5 py-0.5 text-[11px] font-medium text-danger"
        >
          {error}
        </span>
      ) : null}
    </span>
  );
}
