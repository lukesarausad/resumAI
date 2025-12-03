"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Download, Plus } from "lucide-react"

export default function ApplicationPage() {
  const params = useParams()
  const id = params.id as string

  const [application, setApplication] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
  const [newQuestion, setNewQuestion] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchApplication()
  }, [id])

  async function fetchApplication() {
    try {
      const response = await fetch(`/api/applications/${id}`)
      if (response.ok) {
        const data = await response.json()
        setApplication(data)
      } else {
        setError("Failed to load application")
      }
    } catch (err) {
      setError("Failed to load application")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDownloadPDF() {
    try {
      const response = await fetch(`/api/applications/${id}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${application.jobTitle.replace(/[^a-zA-Z0-9]/g, "_")}_resume.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err) {
      console.error("Download failed:", err)
    }
  }

  async function handleGenerateQuestion(e: React.FormEvent) {
    e.preventDefault()
    if (!newQuestion.trim()) return

    setIsGeneratingQuestion(true)
    try {
      const response = await fetch(`/api/applications/${id}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: newQuestion }),
      })

      if (response.ok) {
        const data = await response.json()
        setApplication({
          ...application,
          questionResponses: [...application.questionResponses, data],
        })
        setNewQuestion("")
      }
    } catch (err) {
      console.error("Failed to generate response:", err)
    } finally {
      setIsGeneratingQuestion(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error || "Application not found"}</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{application.jobTitle}</h1>
          <p className="text-muted-foreground mt-1">
            Based on: {application.resumeTitle}
          </p>
        </div>
        <Button onClick={handleDownloadPDF}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm whitespace-pre-wrap max-h-[400px] overflow-y-auto">
              {application.jobDescription}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tailored Resume Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-4 max-h-[400px] overflow-y-auto">
              <div>
                <h3 className="font-semibold mb-2">Contact</h3>
                <p>{application.tailoredContent.contact.name}</p>
                <p>{application.tailoredContent.contact.email}</p>
              </div>

              {application.tailoredContent.experience?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Experience</h3>
                  {application.tailoredContent.experience.map((exp: any, idx: number) => (
                    <div key={idx} className="mb-3">
                      <p className="font-medium">{exp.position} at {exp.company}</p>
                      <p className="text-xs text-muted-foreground">{exp.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Questions</CardTitle>
          <CardDescription>
            Generate AI responses to application questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {application.questionResponses?.map((qr: any, idx: number) => (
            <div key={idx} className="border-b pb-4 last:border-b-0">
              <h4 className="font-semibold mb-2">{qr.question}</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {qr.response}
              </p>
            </div>
          ))}

          <form onSubmit={handleGenerateQuestion} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newQuestion">Add Application Question</Label>
              <Textarea
                id="newQuestion"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g., Why do you want to work at our company?"
                rows={3}
                disabled={isGeneratingQuestion}
              />
            </div>
            <Button
              type="submit"
              disabled={isGeneratingQuestion || !newQuestion.trim()}
            >
              {isGeneratingQuestion ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Response...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Response
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>LaTeX Source</CardTitle>
          <CardDescription>
            Raw LaTeX code for your tailored resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto max-h-[400px]">
            {application.tailoredLatex}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
