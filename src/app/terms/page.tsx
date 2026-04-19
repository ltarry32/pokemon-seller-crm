export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6 text-zinc-300">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <p className="mb-4">
        By accessing or using CollectorVault, you agree to be bound by these Terms of Service.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Use of Service</h2>
      <p>
        CollectorVault is designed to help users track Pokémon card inventory, sales, and performance.
        You agree to use the service only for lawful purposes.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">User Accounts</h2>
      <p>
        You are responsible for maintaining the confidentiality of your account and for all activity
        that occurs under your account.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">User Data</h2>
      <p>
        You retain ownership of the data you enter into CollectorVault. We do not sell your data.
        You are responsible for the accuracy of your inventory and financial records.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Subscriptions & Pricing</h2>
      <p>
        Certain features may require a paid subscription. Pricing and features are subject to change.
        Any future billing will be clearly communicated before charges occur.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Acceptable Use</h2>
      <ul className="list-disc ml-6 space-y-2">
        <li>No misuse, hacking, or attempts to disrupt the service</li>
        <li>No uploading malicious or harmful content</li>
        <li>No abuse of API or automated systems</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">Termination</h2>
      <p>
        We reserve the right to suspend or terminate accounts that violate these terms or misuse the platform.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Disclaimer</h2>
      <p>
        CollectorVault is provided &quot;as is&quot; without warranties of any kind. We do not guarantee accuracy of pricing,
        market data, or financial calculations.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Limitation of Liability</h2>
      <p>
        CollectorVault is not liable for any financial losses, data loss, or damages resulting from use of the service.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p>
        For questions or support:{' '}
        <a href="mailto:support.collectorvault@gmail.com" className="underline hover:no-underline">
          support.collectorvault@gmail.com
        </a>
      </p>
    </div>
  )
}