import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Loader2, Trash2 } from "lucide-react";

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
    return <span className="block size-10 shrink-0 animate-pulse rounded-lg bg-muted" />;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="block size-10 shrink-0 overflow-hidden rounded-lg border"
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
    <span className="inline-flex items-center gap-1">
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
        size="sm"
        className="h-8 px-2 text-muted-foreground"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        aria-label={currentPath ? "Replace receipt photo" : "Add receipt photo"}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
      </Button>
      {currentPath ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground"
          disabled={busy}
          onClick={() => remove.mutate()}
          aria-label="Remove receipt photo"
        >
          <Trash2 className="size-4" />
        </Button>
      ) : null}
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </span>
  );
}
