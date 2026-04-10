import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { api, uploadStatement } from "@/lib/api"
import type { Account, StatementStatus } from "@/types"

interface UploadStatementDialogProps {
  account: Account
  onClose: () => void
  onUploaded: () => void
}

export default function UploadStatementDialog({
  account,
  onClose,
  onUploaded,
}: UploadStatementDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "uploading" | "parsing" | "done" | "error">("idle")
  const [message, setMessage] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setStatus("uploading")
    setMessage("Uploading PDF...")

    try {
      const result = await uploadStatement(account.id, file)
      setStatus("parsing")
      setMessage("Parsing transactions with AI... This may take 20-60 seconds.")

      // Poll for status
      const poll = async () => {
        const statusResult = await api.get<StatementStatus>(
          `/api/v1/statements/${result.statement_id}/status`
        )

        if (statusResult.status === "completed") {
          setStatus("done")
          setMessage("Done! Transactions imported successfully.")
          onUploaded()
          setTimeout(onClose, 1500)
        } else if (statusResult.status === "failed") {
          setStatus("error")
          setMessage(statusResult.error_message ?? "Parsing failed. Please try again.")
        } else {
          setTimeout(poll, 2000)
        }
      }

      setTimeout(poll, 2000)
    } catch (err) {
      setStatus("error")
      setMessage(err instanceof Error ? err.message : "Upload failed")
    }
  }

  const isProcessing = status === "uploading" || status === "parsing"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl ring-1 ring-foreground/10">
        <h2 className="mb-1 text-lg font-semibold">Upload Bank Statement</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {account.bank_name} — {account.account_name}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="text-center">
                <p className="font-medium text-sm">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.size / 1024).toFixed(0)} KB
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Click to select PDF</p>
                <p className="text-xs text-muted-foreground mt-1">Bank statement PDF only</p>
              </div>
            )}
          </div>

          {message && (
            <p
              className={`text-sm ${
                status === "error"
                  ? "text-red-500"
                  : status === "done"
                  ? "text-green-600"
                  : "text-muted-foreground"
              }`}
            >
              {isProcessing && (
                <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {message}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || isProcessing || status === "done"}>
              {isProcessing ? "Processing..." : "Upload & Parse"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
