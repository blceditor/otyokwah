import { NextResponse } from 'next/server';
import { requireKeystatic } from '@/lib/keystatic/auth';

type DeploymentState = 'READY' | 'BUILDING' | 'QUEUED' | 'ERROR' | 'CANCELED';
type UserFriendlyState = 'Published' | 'Deploying' | 'Failed' | 'Draft';

interface VercelDeployment {
  uid: string;
  state: DeploymentState;
  created: number;
  target: string;
}

interface VercelApiResponse {
  deployments: VercelDeployment[];
}

function mapDeploymentState(vercelState: DeploymentState): UserFriendlyState {
  switch (vercelState) {
    case 'READY':
      return 'Published';
    case 'BUILDING':
    case 'QUEUED':
      return 'Deploying';
    case 'ERROR':
    case 'CANCELED':
      return 'Failed';
    default:
      return 'Failed';
  }
}

export async function GET(): Promise<NextResponse> {
  const authError = await requireKeystatic();
  if (authError) return authError;

  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    return NextResponse.json(
      {
        error: true,
        message: 'Missing environment variable configuration',
      },
      { status: 500 }
    );
  }

  try {
    const url = `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&limit=1&target=production`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        return NextResponse.json(
          {
            error: true,
            message: 'Vercel API rate limit exceeded',
          },
          { status: 429 }
        );
      }

      throw new Error(`Vercel API error: ${response.status}`);
    }

    const data: VercelApiResponse = await response.json();

    if (!data.deployments || data.deployments.length === 0) {
      return NextResponse.json(
        {
          status: 'DRAFT',
          state: 'Draft',
          timestamp: null,
        },
        {
          headers: {
            'Cache-Control': 'no-cache, must-revalidate',
          },
        }
      );
    }

    const deployment = data.deployments[0];
    const userFriendlyState = mapDeploymentState(deployment.state);

    return NextResponse.json(
      {
        status: deployment.state,
        state: userFriendlyState,
        timestamp: deployment.created,
      },
      {
        headers: {
          'Cache-Control': 'no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: true,
        message: `Failed to fetch deployment status: ${error instanceof Error ? error.message.toLowerCase() : 'unknown error'}`,
      },
      { status: 500 }
    );
  }
}
