import DashboardLayout from '@/components/DashboardLayout';

export default function TestPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-red-600">🎯 NEW TEST PAGE - CHANGES ARE WORKING!</h1>
        <p className="text-xl mt-4">If you can see this, the build system is functioning correctly.</p>
      </div>
    </DashboardLayout>
  );
}
