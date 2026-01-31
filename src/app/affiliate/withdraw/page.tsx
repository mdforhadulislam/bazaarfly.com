"use client";

import { useState } from "react";

type WithdrawHistory = {
  id: string;
  amount: number;
  method: string;
  status: "pending" | "completed";
  date: string;
};

const history: WithdrawHistory[] = [
  {
    id: "WD-1001",
    amount: 500,
    method: "bKash",
    status: "completed",
    date: "25 Jan 2026",
  },
  {
    id: "WD-1002",
    amount: 300,
    method: "Bank Transfer",
    status: "pending",
    date: "20 Jan 2026",
  },
];

export default function AffiliateWithdrawPage() {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bKash");
  const [account, setAccount] = useState("");

  const availableBalance = 1250;

  const handleWithdraw = () => {
    alert("Withdraw request submitted (demo)");
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">
          Withdraw Earnings
        </h1>
        <p className="text-sm text-gray-500">
          Request withdrawal to your preferred payment method.
        </p>
      </div>

      {/* Withdraw Form */}
      <div className="bg-white border rounded-xl p-6 space-y-5">

        <div>
          <p className="text-sm text-gray-500">
            Available Balance
          </p>
          <p className="text-2xl font-bold text-orange-600">
            ৳{availableBalance}
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Withdraw Amount
          </label>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum withdraw ৳500
          </p>
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Payment Method
          </label>

          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
          >
            <option>bKash</option>
            <option>Nagad</option>
            <option>Rocket</option>
            <option>Bank Transfer</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Account Number / Details
          </label>
          <input
            placeholder="Enter account number or bank details"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-orange-500 outline-none"
          />
        </div>

        <button
          onClick={handleWithdraw}
          className="px-6 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700"
        >
          Request Withdraw
        </button>

      </div>

      {/* Withdraw History */}
      <div className="bg-white border rounded-xl overflow-hidden">

        <div className="p-5 border-b">
          <h2 className="font-semibold">
            Withdraw History
          </h2>
        </div>

        <div className="divide-y">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-5 flex justify-between items-center hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-sm">
                  ৳{item.amount}
                </p>
                <p className="text-xs text-gray-500">
                  {item.method}
                </p>
                <p className="text-xs text-gray-500">
                  {item.date}
                </p>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  item.status === "completed"
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
