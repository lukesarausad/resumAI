import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, ChevronRight } from "lucide-react"

async function getResumes() {
  // This would be called from a server component
  // For now, we'll make it client-side in the actual implementation
  return []
}

export async function ResumeList() {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Upload a resume to get started
      </p>
    </div>
  )
}
