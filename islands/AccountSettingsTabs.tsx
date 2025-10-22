// Island component for account settings tabs
import { useState } from "preact/hooks";
import ChangePasswordForm from "./ChangePasswordForm.tsx";
import ChangeEmailForm from "./ChangeEmailForm.tsx";

export default function AccountSettingsTabs() {
  const [activeTab, setActiveTab] = useState<"password" | "email">("password");

  return (
    <>
      {/* Tab Navigation */}
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              type="button"
              onClick={() => setActiveTab("password")}
              class={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "password"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Change Password
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("email")}
              class={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "email"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Change Email
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "password" && <ChangePasswordForm />}
      {activeTab === "email" && <ChangeEmailForm />}
    </>
  );
}
