import AboutLayout from "@/components/Layout/AboutLayout";

export default function PrivacyPolicyPage() {
  return (
    <AboutLayout title="Privacy Policy">
      <p className="text-sm text-gray-500 mb-4">
        Last Updated: 08 February 2024
      </p>

      <p className="mb-4 text-gray-700">
        Bazaarfly understands that our users care about their personal data
        and how it is collected, used, shared and protected. We are
        committed to handling your personal data in accordance with applicable
        laws when you use our platform, services, or interact with us through
        any device or communication channel.
      </p>

      <p className="mb-6 text-gray-700 font-medium">
        PLEASE READ THIS PRIVACY POLICY CAREFULLY. BY USING BAZAARFLY
        SERVICES, YOU CONSENT TO THE COLLECTION, USE, DISCLOSURE AND
        PROCESSING OF YOUR PERSONAL DATA AS DESCRIBED IN THIS POLICY.
      </p>

      {/* Section 1 */}
      <h2 className="text-lg font-semibold mb-2">
        1. Introduction to this Privacy Policy
      </h2>
      <p className="mb-6 text-gray-700">
        This Privacy Policy explains how Bazaarfly collects, uses and protects
        information when you use our platform or services. This policy applies
        whether or not you have registered an account as a buyer or seller.
        We may update this policy from time to time, and continued use of our
        platform means acceptance of those changes.
      </p>

      {/* Section 2 */}
      <h2 className="text-lg font-semibold mb-2">
        2. Personal Data We Collect
      </h2>
      <p className="mb-2 text-gray-700">
        Depending on how you use Bazaarfly, we may collect:
      </p>

      <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
        <li>Name, email address, phone number and profile details.</li>
        <li>Delivery and billing address information.</li>
        <li>Order, payment and transaction details.</li>
        <li>Usage data and browsing information.</li>
        <li>Marketing and communication preferences.</li>
        <li>Location information when required for delivery.</li>
        <li>Identity verification information if required.</li>
      </ul>

      <p className="mb-6 text-gray-700">
        Some data may be collected automatically through cookies and device
        information when you access our services.
      </p>

      {/* Section 3 */}
      <h2 className="text-lg font-semibold mb-2">
        3. How We Use Personal Data
      </h2>

      <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
        <li>To operate and improve Bazaarfly services.</li>
        <li>To process and deliver orders.</li>
        <li>To manage accounts and provide customer support.</li>
        <li>To analyze usage and improve platform performance.</li>
        <li>To prevent fraud and ensure security.</li>
        <li>To comply with legal obligations.</li>
        <li>To provide marketing communications where permitted.</li>
      </ul>

      {/* Section 4 */}
      <h2 className="text-lg font-semibold mb-2">
        4. Withdrawal of Consent
      </h2>
      <p className="mb-6 text-gray-700">
        You may withdraw consent for processing your data at any time. However,
        this may affect our ability to continue providing certain services.
      </p>

      {/* Section 5 */}
      <h2 className="text-lg font-semibold mb-2">
        5. Updating Your Information
      </h2>
      <p className="mb-6 text-gray-700">
        Users are responsible for ensuring their personal data is accurate and
        updated. Information can usually be updated through account settings.
      </p>

      {/* Section 6 */}
      <h2 className="text-lg font-semibold mb-2">
        6. Accessing and Correcting Data
      </h2>
      <p className="mb-6 text-gray-700">
        You may request access to or correction of your personal data subject
        to applicable laws and verification procedures.
      </p>

      {/* Section 7 */}
      <h2 className="text-lg font-semibold mb-2">
        7. Security of Personal Data
      </h2>
      <p className="mb-6 text-gray-700">
        Bazaarfly implements administrative, physical and technical security
        measures to protect personal data. However, no internet transmission is
        completely secure, so users should also take precautions.
      </p>

      {/* Section 8 */}
      <h2 className="text-lg font-semibold mb-2">
        8. Data Retention
      </h2>
      <p className="mb-6 text-gray-700">
        Personal data is retained only as long as necessary for business,
        operational or legal requirements.
      </p>

      {/* Section 9 */}
      <h2 className="text-lg font-semibold mb-2">9. Minors</h2>
      <p className="mb-6 text-gray-700">
        Bazaarfly services are not intended for minors without parental or
        guardian supervision.
      </p>

      {/* Section 10 */}
      <h2 className="text-lg font-semibold mb-2">
        10. Third Party Websites
      </h2>
      <p className="mb-6 text-gray-700">
        Bazaarfly may link to third-party websites. We are not responsible for
        their privacy practices or content.
      </p>

      {/* Section 11 */}
      <h2 className="text-lg font-semibold mb-2">
        11. Contact for Privacy Matters
      </h2>
      <p className="mb-2 text-gray-700">
        For privacy-related concerns, contact:
      </p>

      <p className="text-gray-700">
        Email: privacy@bazaarfly.com <br />
        Address: Bazaarfly, Bangladesh <br />
        Attention: Data Protection Officer
      </p>

      {/* Section 12 */}
      <h2 className="text-lg font-semibold mt-6 mb-2">
        12. Country Specific Application
      </h2>
      <p className="text-gray-700">
        This Privacy Policy applies to processing of personal data within
        Bangladesh and in compliance with applicable local laws and regulations.
      </p>
    </AboutLayout>
  );
}
