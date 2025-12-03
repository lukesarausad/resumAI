"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function ResumeUpload() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsUploading(true)
    setError("")

    const formData = new FormData(event.currentTarget)

    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      // Refresh the page to show the new resume
      router.refresh()

      // Reset form
      event.currentTarget.reset()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="file">Upload Resume (PDF)</Label>
        <Input
          id="file"
          name="file"
          type="file"
          accept=".pdf"
          required
          disabled={isUploading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title (optional)</Label>
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="e.g., Software Engineer Resume"
          disabled={isUploading}
        />
      </div>

      <Button type="submit" disabled={isUploading} className="w-full">
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading & Parsing...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Resume
          </>
        )}
      </Button>
    </form>
  )
}
