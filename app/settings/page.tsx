'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { SidebarNav } from '@/components/layout/sidebar-nav';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    monthlyIncome: 2000,
    currency: 'USD',
    theme: 'light',
    notificationsEnabled: true,
    budgetAlerts: true,
    recurringExpenseReminder: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background lg:pl-64">
      <SidebarNav />
      
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground text-sm">Manage your preferences and account</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Financial Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Financial Settings</CardTitle>
            <CardDescription>Configure your financial preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Income</label>
                <Input
                  type="number"
                  value={settings.monthlyIncome}
                  onChange={(e) =>
                    setSettings({ ...settings, monthlyIncome: parseFloat(e.target.value) })
                  }
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used for savings rate calculation
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <Select
                  value={settings.currency}
                  onValueChange={(value) => setSettings({ ...settings, currency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                    <SelectItem value="AUD">AUD (A$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how SmartSpend looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <Select
                value={settings.theme}
                onValueChange={(value) => setSettings({ ...settings, theme: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Control when you receive alerts and reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) =>
                  setSettings({ ...settings, notificationsEnabled: e.target.checked })
                }
                className="w-4 h-4 rounded border-muted"
              />
              <div>
                <p className="font-medium text-sm">Enable Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive alerts for budget milestones and expense patterns
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.budgetAlerts}
                onChange={(e) =>
                  setSettings({ ...settings, budgetAlerts: e.target.checked })
                }
                className="w-4 h-4 rounded border-muted"
              />
              <div>
                <p className="font-medium text-sm">Budget Alerts</p>
                <p className="text-xs text-muted-foreground">
                  Get notified when you're near or exceed budget limits
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.recurringExpenseReminder}
                onChange={(e) =>
                  setSettings({ ...settings, recurringExpenseReminder: e.target.checked })
                }
                className="w-4 h-4 rounded border-muted"
              />
              <div>
                <p className="font-medium text-sm">Recurring Expense Reminders</p>
                <p className="text-xs text-muted-foreground">
                  Get reminded about upcoming recurring expenses
                </p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>Manage your data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Download My Data
            </Button>
            <Button variant="outline" className="w-full">
              Export as CSV
            </Button>
            <Button variant="destructive" className="w-full">
              Delete All Data
            </Button>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3 justify-end">
          <Link href="/">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleSave} className={`${saved ? 'bg-green-600' : ''}`}>
            {saved ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Saved
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
