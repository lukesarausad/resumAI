export async function ApplicationList({ limit }: { limit?: number }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        No applications yet. Upload a resume and create your first tailored application.
      </p>
    </div>
  )
}
