import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus, Briefcase } from "lucide-react"
import { ResumeUpload } from "@/components/resume-upload"
import { ResumeList } from "@/components/resume-list"
import { ApplicationList } from "@/components/application-list"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your resumes and job applications
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Resumes
            </CardTitle>
            <CardDescription>
              Upload and manage your base resumes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResumeUpload />
            <div className="mt-6">
              <ResumeList />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Recent Applications
            </CardTitle>
            <CardDescription>
              Your tailored resumes and applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApplicationList limit={5} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
