import AboutLayout from "@/components/Layout/AboutLayout";

export default function CancellationPolicyPage() {
  return (
    <AboutLayout title="Cancellation Policy">
      <p className="text-sm text-gray-500 mb-4">
        Last Updated: 20 September 2024
      </p>

      <p className="mb-6 text-gray-700">
        At <strong>Bazaarfly</strong>, we understand that plans can change.
        Our cancellation policy is designed to offer flexibility while
        ensuring smooth order processing.
      </p>

      {/* Section 1 */}
      <h2 className="text-lg font-semibold mb-2">
        1. Customer-Initiated Cancellations
      </h2>

      <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
        <li>
          Orders can be canceled before shipment, within
          <strong> 1 hour </strong> of placing the order.
        </li>
        <li>
          To cancel an order, please contact our Customer Support team via
          phone, email, or live chat and provide your Order ID.
        </li>
        <li>
          Once an order has been dispatched, it cannot be canceled. However,
          customers may request a return or exchange according to our Return
          and Exchange policies.
        </li>
        <li>
          If an order includes multiple items, customers may cancel one or
          more items before shipment. Refunds or payment adjustments will be
          processed accordingly.
        </li>
      </ul>

      {/* Section 2 */}
      <h2 className="text-lg font-semibold mb-2">
        2. Bazaarfly-Initiated Cancellations
      </h2>

      <p className="mb-2 text-gray-700">
        Bazaarfly reserves the right to cancel orders under the following
        circumstances:
      </p>

      <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
        <li>The product is out of stock.</li>
        <li>There is a pricing, listing, or technical error.</li>
        <li>The delivery address provided is invalid or unreachable.</li>
        <li>
          The customer is unresponsive during verification or confirmation
          processes.
        </li>
      </ul>

      {/* Section 3 */}
      <h2 className="text-lg font-semibold mb-2">3. Contact Us</h2>

      <p className="mb-2 text-gray-700">
        For any cancellation-related queries or assistance, please contact us:
      </p>

      <p className="text-gray-700">
        📞 Phone: +88 01XXXXXXXXXX   <br />
        📧 Email: support@bazaarfly.com
      </p>

      <p className="mt-6 text-gray-700">
        By placing an order with <strong>Bazaarfly</strong>, you acknowledge
        and agree to the terms and conditions outlined in this Cancellation
        Policy.
      </p>
    </AboutLayout>
  );
}
