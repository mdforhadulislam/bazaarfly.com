import AboutLayout from "@/components/Layout/AboutLayout";

export default function ShippingDeliveryPolicyPage() {
  return (
    <AboutLayout title="Shipping & Delivery Policy">
      <p className="text-sm text-gray-500 mb-4">
        Last Updated: 20 September 2024
      </p>

      <p className="mb-6 text-gray-700">
        At <strong>Bazaarfly</strong>, we are committed to delivering your
        orders quickly and securely across Bangladesh. Please review the
        following details regarding our shipping and delivery process.
      </p>

      {/* Section 1 */}
      <h2 className="text-lg font-semibold mb-2">
        1. Delivery Coverage
      </h2>

      <p className="mb-6 text-gray-700">
        We deliver across all major cities and districts in Bangladesh. Some
        remote areas may experience extended delivery times depending on
        courier availability.
      </p>

      {/* Section 2 */}
      <h2 className="text-lg font-semibold mb-2">
        2. Delivery Timeframes
      </h2>

      <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
        <li>
          <strong>Inside Dhaka:</strong> Estimated delivery within 24–48
          hours.
        </li>
        <li>
          <strong>Outside Dhaka:</strong> Estimated delivery within 2–3
          business days.
        </li>
        <li>
          Delivery timelines may vary during peak seasons, government
          holidays, or due to natural or operational disruptions.
        </li>
      </ul>

      {/* Section 3 */}
      <h2 className="text-lg font-semibold mb-2">
        3. Shipping Charges
      </h2>

      <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
        <li>
          <strong>Inside Dhaka:</strong> Standard flat rate of BDT 80.
        </li>
        <li>
          <strong>Outside Dhaka:</strong> Standard flat rate of BDT 120.
        </li>
        <li>
          All delivery charges are clearly displayed at checkout before order
          confirmation.
        </li>
      </ul>

      {/* Section 4 */}
      <h2 className="text-lg font-semibold mb-2">
        4. Payment & Delivery Method
      </h2>

      <p className="mb-6 text-gray-700">
        Cash on Delivery (COD) is available nationwide. Please keep the exact
        payment amount ready to hand over to the delivery agent upon arrival
        for faster delivery processing.
      </p>

      {/* Section 5 */}
      <h2 className="text-lg font-semibold mb-2">5. Contact Us</h2>

      <p className="mb-2 text-gray-700">
        For any delivery-related assistance, please contact us:
      </p>

      <p className="text-gray-700">
        📞 Phone: +88 01XXXXXXXXXX <br />
        📧 Email: support@bazaarfly.com
      </p>

      <p className="mt-6 text-gray-700">
        By shopping at <strong>Bazaarfly</strong>, you acknowledge and agree
        to the terms outlined in this Shipping & Delivery Policy.
      </p>
    </AboutLayout>
  );
}
