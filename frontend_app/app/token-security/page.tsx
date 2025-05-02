'use client';

import React from 'react';
import { TokenSecurityReport } from '../../frontend_agent/tools/messari/components/TokenSecurityReport';

export default function TokenSecurityPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Token Security Analysis</h1>
      <TokenSecurityReport />
    </div>
  );
} 