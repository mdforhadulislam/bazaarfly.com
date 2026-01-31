"use client";

import Link from "next/link";

const addresses = [
  {
    id: "addr1",
    name: "Forhadul Islam",
    phone: "01930631910",
    address: "House 12, Road 5, Uttara, Dhaka",
    city: "Dhaka",
    isDefault: true,
  },
  {
    id: "addr2",
    name: "Office Address",
    phone: "01930631910",
    address: "Banani DOHS, Road 8",
    city: "Dhaka",
    isDefault: false,
  },
];

export default function AddressPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">
          My Addresses
        </h1>

        <Link
          href="/account/address/new"
          className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm"
        >
          Add Address
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="bg-white border rounded-xl p-5 hover:shadow-sm transition"
          >
            <div className="flex flex-col md:flex-row md:justify-between gap-3">

              <div>
                <div className="flex gap-2 items-center">
                  <p className="font-semibold">
                    {addr.name}
                  </p>

                  {addr.isDefault && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500">
                  {addr.phone}
                </p>

                <p className="text-sm text-gray-500">
                  {addr.address}, {addr.city}
                </p>
              </div>

              <div className="flex gap-3 md:items-end">
                <Link
                  href={`/account/address/${addr.id}`}
                  className="text-sm text-orange-600"
                >
                  Edit
                </Link>

                <button className="text-sm text-red-600">
                  Delete
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
