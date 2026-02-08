"use client";

import { Wallet, ArrowDownRight, ArrowUpRight } from "lucide-react";

type Transaction = {
  id: string;
  type: "earning" | "withdraw";
  amount: number;
  date: string;
  status: "completed" | "pending";
};

const transactions: Transaction[] = [
  {
    id: "TXN-1001",
    type: "earning",
    amount: 120,
    date: "30 Jan 2026",
    status: "completed",
  },
  {
    id: "TXN-1002",
    type: "earning",
    amount: 200,
    date: "29 Jan 2026",
    status: "completed",
  },
  {
    id: "TXN-1003",
    type: "withdraw",
    amount: 500,
    date: "25 Jan 2026",
    status: "completed",
  },
  {
    id: "TXN-1004",
    type: "withdraw",
    amount: 300,
    date: "20 Jan 2026",
    status: "pending",
  },
];

export default function AffiliateWalletPage() {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">
          Wallet
        </h1>
        <p className="text-sm text-gray-500">
          Track your affiliate earnings and withdrawals.
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">Available Balance</p>
          <p className="text-2xl font-bold text-orange-600">
            ৳1,250
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">Total Earned</p>
          <p className="text-xl font-semibold">
            ৳2,050
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">Withdrawn</p>
          <p className="text-xl font-semibold">
            ৳800
          </p>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-xl font-semibold text-yellow-600">
            ৳300
          </p>
        </div>

      </div>

      {/* Withdraw Action */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-orange-600 text-white">
            <Wallet size={18} />
          </div>

          <div>
            <p className="font-semibold">
              Ready to withdraw your earnings?
            </p>
            <p className="text-sm text-gray-600">
              Minimum withdrawal ৳500
            </p>
          </div>
        </div>

        <button className="px-6 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700">
          Request Withdraw
        </button>
      </div>

      {/* Transactions */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-5 border-b">
          <h2 className="font-semibold">
            Recent Transactions
          </h2>
        </div>

        <div className="divide-y">
          {transactions.map((tx) => {
            const isEarning = tx.type === "earning";

            return (
              <div
                key={tx.id}
                className="p-5 flex justify-between items-center hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 flex items-center justify-center rounded-full ${
                      isEarning
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {isEarning ? (
                      <ArrowDownRight size={16} />
                    ) : (
                      <ArrowUpRight size={16} />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium capitalize">
                      {tx.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tx.date}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold">
                    {isEarning ? "+" : "-"}৳{tx.amount}
                  </p>
                  <p
                    className={`text-xs ${
                      tx.status === "completed"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {tx.status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
