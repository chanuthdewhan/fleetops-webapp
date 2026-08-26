import { Button } from "@/components/ui/button";

function DashboardPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Fleet Ops - Dashboard</h1>
        <Button>Test Button</Button>
      </div>
    </section>
  );
}

export default DashboardPage;
