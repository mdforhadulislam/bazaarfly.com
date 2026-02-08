import AboutLayout from "@/components/Layout/AboutLayout";

export default function ReturnRefundPolicyPage() {
  return (
    <AboutLayout title="Return & Refund Policy">
      <p className="text-sm text-gray-500 mb-4">
        Last Updated: 20 September 2024
      </p>

      <p className="mb-6 text-gray-700">
        Thank you for shopping with <strong>Bazaarfly</strong>. We truly
        appreciate your trust and are committed to providing you with a smooth
        and satisfying shopping experience. Please read this policy carefully
        to understand your rights and responsibilities regarding returns and
        refunds.
      </p>

      {/* 1 */}
      <h2 className="text-lg font-semibold mb-2">
        1. Eligibility for Returns and Refunds
      </h2>
      <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
        <li>
          Customers must check the product in front of the delivery person at
          the time of delivery.
        </li>
        <li>
          If the product is damaged, defective, or incorrect, customers must
          inform the delivery person immediately and decline to accept the item.
        </li>
        <li>
          Once the product is accepted and the delivery agent has left, no
          return or refund requests will be accepted.
        </li>
        <li>
          Returned items must remain unused, undamaged, and in their original
          packaging.
        </li>
      </ul>

      {/* 2 */}
      <h2 className="text-lg font-semibold mb-2">2. Refund Timeline</h2>
      <p className="mb-6 text-gray-700">
        Approved refunds are typically processed within <strong>7–10 working
        days</strong>. Refunds will be issued to the original payment method
        used during purchase.
      </p>

      {/* 3 */}
      <h2 className="text-lg font-semibold mb-2">3. Order Cancellation</h2>
      <p className="mb-6 text-gray-700">
        Orders can be canceled within <strong>1 hour</strong> of placement.
        After 1 hour, the order may already be in processing or shipment, and
        cancellation may not be possible.
      </p>

      {/* 4 */}
      <h2 className="text-lg font-semibold mb-2">4. Contact Us</h2>
      <p className="mb-2 text-gray-700">
        If you have any questions about our Return & Refund Policy or need
        assistance, please contact us:
      </p>
      <p className="text-gray-700">
        📞 Phone: +88 01XXXXXXXXXX <br />
        📧 Email: support@bazaarfly.com
      </p>

      {/* 5 */}
      <h2 className="text-lg font-semibold mt-6 mb-2">5. Policy Updates</h2>
      <p className="text-gray-700">
        This policy is subject to change without prior notice. We encourage you
        to review this page periodically to stay updated.
      </p>

      <p className="mt-6 text-gray-700">
        By shopping at <strong>Bazaarfly</strong>, you acknowledge and agree to
        the terms and conditions outlined in this Return & Refund Policy.
      </p>
    </AboutLayout>
  );
}
