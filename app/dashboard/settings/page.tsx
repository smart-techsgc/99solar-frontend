"use client";

import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function SettingsPage() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSave = async () => {
    if (!name || !email) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings.");
      }

    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-start p-4">
      <div className="w-full max-w-lg bg-white p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Settings</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}