'use client';

import React from 'react';
import { Users, FileText, BarChart3, Shield, Building2, Webhook } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/hooks';
import {
  StatsOverview,
  UsersManagement,
  PoliciesManagement,
  ClaimsMonitoring,
  CompaniesManagement,
  WebhookFailures,
} from '@/components/admin';

export default function AdminDashboard() {
  const { data: currentUser } = useCurrentUser();
  const isAdmin = true; 

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md border border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription className="text-gray-600">
              You do not have permission to access the admin dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Manage users, policies, and monitor claims
            </p>
            {currentUser && (
              <p className="text-sm text-gray-500 mt-2">
                Logged in as: <span className="font-medium text-gray-700">{currentUser.username}</span>
              </p>
            )}
          </div>
          <Badge className="bg-green-100 text-green-700 border-green-200 text-sm px-3 py-1 hover:bg-green-100">
            <Shield className="h-3 w-3 mr-1" />
            Admin Access
          </Badge>
        </div>

        {/* Stats Section */}
        <StatsOverview />

        {/* Main Content Section */}
        <Card className="border border-gray-200 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <Tabs defaultValue="companies" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5 lg:w-auto bg-gray-100 p-1">
                <TabsTrigger
                  value="companies"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600"
                >
                  <Building2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Companies</span>
                </TabsTrigger>
                <TabsTrigger
                  value="webhooks"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600"
                >
                  <Webhook className="h-4 w-4" />
                  <span className="hidden sm:inline">Webhooks</span>
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Users</span>
                </TabsTrigger>
                <TabsTrigger
                  value="policies"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600"
                >
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Policies</span>
                </TabsTrigger>
                <TabsTrigger
                  value="claims"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Claims</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="companies" className="space-y-4">
                <CompaniesManagement />
              </TabsContent>

              <TabsContent value="webhooks" className="space-y-4">
                <WebhookFailures />
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <UsersManagement />
              </TabsContent>

              <TabsContent value="policies" className="space-y-4">
                <PoliciesManagement />
              </TabsContent>

              <TabsContent value="claims" className="space-y-4">
                <ClaimsMonitoring />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
