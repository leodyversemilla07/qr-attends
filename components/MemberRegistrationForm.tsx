// Component for registering a new member
import { useState } from "preact/hooks";

interface MemberRegistrationFormProps {
  memberId: string;
  onSuccess: (memberName: string) => void;
  onCancel: () => void;
}

export default function MemberRegistrationForm(
  { memberId, onSuccess, onCancel }: MemberRegistrationFormProps,
) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [studentId, setStudentId] = useState("");
  const [yearSection, setYearSection] = useState("");
  const [cardNo, setCardNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (
      !firstName.trim() || !lastName.trim() || !middleInitial.trim() ||
      !studentId.trim() || !yearSection.trim() || !cardNo.trim()
    ) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: memberId,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          middleInitial: middleInitial.trim().toUpperCase(),
          studentId: studentId.trim(),
          yearSection: yearSection.trim(),
          cardNo: cardNo.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess(`${data.firstName} ${data.lastName}`);
      } else {
        setError(data.error || "Failed to register member");
      }
    } catch (err) {
      setError(
        "An error occurred: " +
          (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div class="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 sm:p-6">
      <h3 class="text-lg sm:text-xl font-bold mb-2 text-yellow-900">
        New Member Detected
      </h3>
      <p class="text-sm sm:text-base text-yellow-800 mb-3">
        Member ID:{" "}
        <code class="bg-yellow-100 px-2 py-1 rounded font-mono text-xs sm:text-sm">
          {memberId}
        </code>
      </p>
      <p class="text-sm sm:text-base text-gray-700 mb-4">
        This member is not registered in the system. Please enter their details
        to continue:
      </p>

      <form onSubmit={handleSubmit} class="space-y-4 sm:space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-base sm:text-lg font-medium text-gray-700 mb-2">
              First Name <span class="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onInput={(e) =>
                setFirstName((e.target as HTMLInputElement).value)}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="Juan"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label class="block text-base sm:text-lg font-medium text-gray-700 mb-2">
              Last Name <span class="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onInput={(e) => setLastName((e.target as HTMLInputElement).value)}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="Dela Cruz"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label class="block text-base sm:text-lg font-medium text-gray-700 mb-2">
            Middle Initial <span class="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={middleInitial}
            onInput={(e) =>
              setMiddleInitial((e.target as HTMLInputElement).value)}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            placeholder="P"
            maxLength={1}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label class="block text-base sm:text-lg font-medium text-gray-700 mb-2">
            Student ID <span class="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={studentId}
            onInput={(e) => setStudentId((e.target as HTMLInputElement).value)}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            placeholder="MBC2025-0165"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label class="block text-base sm:text-lg font-medium text-gray-700 mb-2">
            Year/Section <span class="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={yearSection}
            onInput={(e) =>
              setYearSection((e.target as HTMLInputElement).value)}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            placeholder="BSIT 4F1"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label class="block text-base sm:text-lg font-medium text-gray-700 mb-2">
            Card No. <span class="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={cardNo}
            onInput={(e) => setCardNo((e.target as HTMLInputElement).value)}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            placeholder="Card number"
            required
            disabled={loading}
          />
        </div>

        {error && (
          <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        <div class="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            class="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base sm:text-lg"
          >
            {loading ? "Registering..." : "Register & Check In"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base sm:text-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
