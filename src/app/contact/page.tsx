export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-6 text-zinc-300">
      <h1 className="text-3xl font-bold mb-6">Contact</h1>

      <p>Need help? Reach out anytime:</p>

      <p className="mt-4">
  <a href="mailto:support.collectorvault@gmail.com" className="hover:underline">
    support.collectorvault@gmail.com
  </a>
</p>

      <p className="mt-6 text-sm text-zinc-500">
        We typically respond within 24–48 hours.
      </p>
    </div>
  )
}