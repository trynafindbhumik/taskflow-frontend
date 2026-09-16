import type { Metadata } from 'next';

import { AiWorkspace } from '@/components/ai/AiWorkspace';

export const metadata: Metadata = {
  title: 'AI Workspace | TaskFlow',
  description: 'AI Project Management Agent & Interactive Implementation Plan Artifacts',
};

export default function AiPage() {
  return <AiWorkspace />;
}
