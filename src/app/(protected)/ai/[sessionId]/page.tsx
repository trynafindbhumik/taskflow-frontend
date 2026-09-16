import type { Metadata } from 'next';

import { AiWorkspace } from '@/components/ai/AiWorkspace';

export const metadata: Metadata = {
  title: 'AI Session | TaskFlow',
  description: 'AI Project Management Session & Interactive Artifacts',
};

interface Props {
  params: Promise<{ sessionId: string }>;
}

export default async function AiSessionPage({ params }: Props) {
  const resolvedParams = await params;
  return <AiWorkspace initialSessionId={resolvedParams.sessionId} />;
}
