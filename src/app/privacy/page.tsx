export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6 text-zinc-300">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        CollectorVault collects and stores information necessary to provide its services,
        including account details, inventory data, and usage activity.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Information We Collect</h2>
      <ul className="list-disc ml-6 space-y-2">
        <li>Email address and account credentials</li>
        <li>Card inventory data you enter</li>
        <li>Transaction and sales data</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Information</h2>
      <ul className="list-disc ml-6 space-y-2">
        <li>To provide and maintain the app</li>
        <li>To improve features and performance</li>
        <li>To support user accounts</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Data Security</h2>
      <p>
        We use industry-standard tools (such as Supabase) to securely store your data.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p>
        For questions, contact: <strong>support@yourdomain.com</strong>
      </p>
    </div>
  )
}