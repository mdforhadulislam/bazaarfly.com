import AboutLayout from "@/components/Layout/AboutLayout";

export default function TermsConditionsPage() {
  return (
    <AboutLayout title="Terms & Conditions">
      <p className="text-sm text-gray-500 mb-4">
        Last Updated: 04 February 2024
      </p>

      <p className="mb-6 text-gray-700">
        Welcome to <strong>Bazaarfly</strong>! These Terms and Conditions govern
        your access to and use of the Bazaarfly website, mobile application, and
        related services (collectively referred to as the “Service”). By
        accessing or using our Service, you agree to comply with and be bound by
        these Terms. If you do not agree, please discontinue use immediately.
      </p>

      {/* Section 1 */}
      <h2 className="text-lg font-semibold mb-2">
        1. User Accounts and Registration
      </h2>
      <p className="mb-6 text-gray-700">
        To access certain features of the Service, users may be required to
        create an account. You are responsible for maintaining the
        confidentiality of your login credentials and for all activities that
        occur under your account. You must provide accurate and up-to-date
        information during registration.
      </p>

      {/* Section 2 */}
      <h2 className="text-lg font-semibold mb-2">2. User Conduct</h2>

      <p className="mb-2 text-gray-700">
        By using Bazaarfly, you agree not to:
      </p>

      <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
        <li>Violate any applicable laws or regulations.</li>
        <li>Infringe upon the rights of others.</li>
        <li>
          Upload, post, or transmit harmful, abusive, or inappropriate content.
        </li>
        <li>Engage in fraudulent, misleading, or unauthorized activities.</li>
        <li>Use the platform for unlawful or prohibited purposes.</li>
      </ul>

      {/* Section 3 */}
      <h2 className="text-lg font-semibold mb-2">3. Intellectual Property</h2>
      <p className="mb-6 text-gray-700">
        All content, trademarks, graphics, logos, designs, and functionalities
        available on the Service are the exclusive property of Bazaarfly and
        protected by applicable intellectual property laws. Unauthorized use,
        reproduction, or distribution is strictly prohibited.
      </p>

      {/* Section 4 */}
      <h2 className="text-lg font-semibold mb-2">
        4. Product Listings and Transactions
      </h2>
      <p className="mb-6 text-gray-700">
        Sellers or shops are responsible for ensuring the accuracy of product
        listings and descriptions. Buyers are responsible for reviewing product
        details before making a purchase. Bazaarfly does not guarantee the
        quality, safety, legality, or suitability of products listed by sellers
        on the platform.
      </p>

      {/* Section 5 */}
      <h2 className="text-lg font-semibold mb-2">
        5. Payment and Transactions
      </h2>
      <p className="mb-6 text-gray-700">
        Payments are securely processed through trusted payment partners.
        Bazaarfly reserves the right to refuse or cancel transactions in cases
        of suspected fraud, pricing errors, or unauthorized activities.
      </p>

      {/* Section 6 */}
      <h2 className="text-lg font-semibold mb-2">6. Privacy Policy</h2>
      <p className="mb-6 text-gray-700">
        By using our Service, you agree to our Privacy Policy, which explains
        how Bazaarfly collects and protects personal data.
      </p>

      {/* Section 7 */}
      <h2 className="text-lg font-semibold mb-2">
        7. Returns, Exchanges, and Refunds
      </h2>
      <p className="mb-6 text-gray-700">
        All returns, exchanges, and refunds are handled according to Bazaarfly’s
        official Return & Refund Policy and Exchange Policy. Users are advised
        to review these policies before placing orders.
      </p>

      {/* Section 8 */}
      <h2 className="text-lg font-semibold mb-2">8. Termination</h2>
      <p className="mb-6 text-gray-700">
        Bazaarfly reserves the right to suspend or terminate user accounts or
        access without notice if violations of these Terms or misuse of the
        platform are detected.
      </p>

      {/* Section 9 */}
      <h2 className="text-lg font-semibold mb-2">9. Updates to Terms</h2>
      <p className="mb-6 text-gray-700">
        Bazaarfly may update these Terms at any time. Continued use of the
        Service after updates constitutes acceptance of revised Terms.
      </p>

      {/* Section 10 */}
      <h2 className="text-lg font-semibold mb-2">
        10. Limitation of Liability
      </h2>
      <p className="mb-6 text-gray-700">
        Bazaarfly, its affiliates, employees, and partners shall not be held
        liable for any damages arising from the use or inability to use the
        Service, including product issues, delivery delays, or technical
        problems.
      </p>

      {/* Section 11 */}
      <h2 className="text-lg font-semibold mb-2">11. Governing Law</h2>
      <p className="mb-6 text-gray-700">
        These Terms are governed by the laws of Bangladesh. Any disputes shall
        fall under the jurisdiction of the courts of Bangladesh.
      </p>

      {/* Section 12 */}
      <h2 className="text-lg font-semibold mb-2">12. Contact Us</h2>

      <p className="mb-2 text-gray-700">
        For questions or concerns regarding these Terms, please contact us:
      </p>

      <p className="text-gray-700">
        📞 Phone: +88 01XXXXXXXXX <br />
        📧 Email: support@bazaarfly.com
      </p>

      <p className="mt-6 text-gray-700">
        By using <strong>Bazaarfly</strong>, you acknowledge that you have read,
        understood, and agreed to these Terms and Conditions.
      </p>
    </AboutLayout>
  );
}
