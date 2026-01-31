import AboutLayout from "@/components/Layout/AboutLayout";

export default function ExchangePolicyPage() {
  return (
    <AboutLayout title="Exchange Policy">
      <p className="text-sm text-gray-500 mb-4">
        Last Updated: 20 September 2024
      </p>

      <p className="mb-6 text-gray-700">
        At <strong>Bazaarfly</strong>, we aim to ensure your complete
        satisfaction with every purchase. Please read the following terms
        carefully before requesting an exchange.
      </p>

      {/* Section 1 */}
      <h2 className="text-lg font-semibold mb-2">
        1. Eligibility for Exchange
      </h2>

      <p className="mb-6 text-gray-700">
        Customers can request a size or color exchange in the presence of the
        delivery agent from the shop or seller from whom the product was
        purchased. The product must be eligible for exchange as mentioned on
        the product page. Products marked as non-exchangeable are not eligible
        for exchange.
      </p>

      {/* Section 2 */}
      <h2 className="text-lg font-semibold mb-2">
        2. Stock Availability
      </h2>

      <p className="mb-6 text-gray-700">
        All exchanges are subject to product availability. If the requested
        size or color is unavailable, the exchange request may not be
        processed.
      </p>

      {/* Section 3 */}
      <h2 className="text-lg font-semibold mb-2">
        3. Exchange Charges
      </h2>

      <p className="mb-6 text-gray-700">
        Customers are responsible for the logistics cost involved in exchange,
        including the delivery charge for the exchanged item and the return
        delivery charge for the original product.
      </p>

      {/* Section 4 */}
      <h2 className="text-lg font-semibold mb-2">4. Contact Us</h2>

      <p className="mb-2 text-gray-700">
        For any exchange-related queries or support, please contact us:
      </p>

      <p className="text-gray-700">
        📞 Phone: +88 01969-901212 <br />
        📧 Email: support@bazaarfly.com
      </p>

      <p className="mt-6 text-gray-700">
        By shopping at <strong>Bazaarfly</strong>, you acknowledge and agree
        to the terms and conditions outlined in this Exchange Policy.
      </p>
    </AboutLayout>
  );
}
