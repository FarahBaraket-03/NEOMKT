'use client';

import { useState, type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ConfirmDeleteDialogProps {
  itemName: string;
  trigger: ReactNode;
  title?: string;
  description?: string;
  onConfirm: () => Promise<void>;
}

export default function ConfirmDeleteDialog({
  itemName,
  trigger,
  title = 'CONFIRM DELETE',
  description,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMatch = value.trim() === itemName;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setValue('');
          setError(null);
        }
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 z-[90]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[91] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 border border-destructive/60 bg-card cyber-chamfer p-6 space-y-4">
          <Dialog.Title className="font-orbitron text-destructive uppercase tracking-wider text-lg">
            {title}
          </Dialog.Title>

          <p className="font-jetbrains text-xs uppercase tracking-widest text-mutedForeground">
            {description ?? `Type ${itemName} to confirm permanent deletion.`}
          </p>

          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="TYPE RESOURCE NAME"
            autoComplete="off"
          />

          {error ? (
            <p className="font-sharetech text-xs uppercase tracking-widest text-destructive">{error}</p>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Dialog.Close asChild>
              <Button variant="ghost">CANCEL</Button>
            </Dialog.Close>
            <Button
              variant="destructive"
              isLoading={submitting}
              disabled={!isMatch}
              onClick={async () => {
                setSubmitting(true);
                setError(null);
                try {
                  await onConfirm();
                  setOpen(false);
                } catch (confirmError) {
                  setError((confirmError as Error).message || 'Deletion failed.');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              DELETE
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
