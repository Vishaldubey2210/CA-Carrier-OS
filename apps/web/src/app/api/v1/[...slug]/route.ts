import { NextRequest, NextResponse } from 'next/server';
import jobsData from '@/data/jobs_store.json';

// In-memory runtime cache for serverless invocation
let applicationsStore: any[] = [];
let savedJobsStore: Set<string> = new Set();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug.join('/');
  const { searchParams } = new URL(request.url);

  // 1. Health check
  if (path === 'health' || path === 'health/ready') {
    return NextResponse.json({
      success: true,
      data: {
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        service: 'ca-career-os-serverless',
      },
    });
  }

  // 2. Jobs list: /api/v1/jobs
  if (path === 'jobs') {
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const opportunityType = searchParams.get('opportunityType') || 'ALL';
    const pathway = searchParams.get('pathway') || 'ALL';
    const city = searchParams.get('city') || 'ALL';

    let filtered = jobsData as any[];

    if (opportunityType !== 'ALL') {
      filtered = filtered.filter((j) => j.opportunityType === opportunityType);
    }
    if (pathway !== 'ALL') {
      filtered = filtered.filter((j) => j.caPathway === pathway);
    }
    if (city !== 'ALL') {
      filtered = filtered.filter((j) =>
        j.locationCity?.toLowerCase().includes(city.toLowerCase())
      );
    }
    if (search) {
      filtered = filtered.filter(
        (j) =>
          j.title?.toLowerCase().includes(search) ||
          j.companyName?.toLowerCase().includes(search) ||
          j.rawDescription?.toLowerCase().includes(search)
      );
    }

    const paginated = filtered.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      total: filtered.length,
      limit,
    });
  }

  // 3. Single job detail: /api/v1/jobs/:id
  if (path.startsWith('jobs/') && slug.length === 2) {
    const jobId = slug[1];
    const job = (jobsData as any[]).find((j) => j.id === jobId);
    if (!job) {
      return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: job });
  }

  // 4. Candidate profile: /api/v1/career/profile
  if (path === 'career/profile') {
    return NextResponse.json({
      success: true,
      data: {
        id: 'prof-candidate-01',
        candidateProfileId: 'usr-candidate-101',
        caFinalStatus: 'QUALIFIED',
        icaiMembershipNo: '542109',
        articleshipFirm: 'Chartered Accountancy Practice',
        articleshipFirmTier: 'MID_SIZE',
        articleshipWeeks: 156,
        articleshipAreas: ['Statutory Audit', 'Direct Tax', 'CARO 2020 Compliance'],
        softwareProficiencies: ['SAP ERP', 'Advanced Excel', 'Tally Prime'],
        preferredPathways: ['AUDIT', 'TAX', 'FPA'],
        targetCities: ['Mumbai', 'Delhi NCR', 'Bengaluru'],
        targetSalaryMin: 1200000,
        targetSalaryMax: 1800000,
        summary: 'ICAI Qualified Chartered Accountant with 36 months audit training.',
      },
    });
  }

  // 5. Applications: /api/v1/applications
  if (path === 'applications') {
    return NextResponse.json({
      success: true,
      data: applicationsStore,
    });
  }

  // 6. Resumes: /api/v1/resumes
  if (path === 'resumes') {
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 'res-master-01',
          title: 'Chartered Accountant — Master Profile',
          targetPathway: 'AUDIT',
          isDefault: true,
          updatedAt: new Date().toISOString(),
          versions: [
            {
              id: 'ver-01-master',
              versionNumber: 1,
              title: 'Master Verified Profile',
              summary: 'ICAI Qualified Chartered Accountant with practical training in Statutory Audit, Ind AS, and Corporate Taxation.',
              matchScore: 92,
            },
          ],
        },
      ],
    });
  }

  // 7. Notifications: /api/v1/notifications
  if (path === 'notifications') {
    return NextResponse.json({
      success: true,
      data: {
        items: [
          {
            id: 'notif-01',
            title: '440+ Articleships Verified',
            message: 'Latest ICAI Form 102/103 & Form 104 opportunities synced.',
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        ],
        unreadCount: 1,
      },
    });
  }

  // 8. Practice tasks & checklists: /api/v1/practice/...
  if (path.startsWith('practice/')) {
    if (path === 'practice/post-qualification/checklist') {
      return NextResponse.json({
        success: true,
        data: [
          { taskKey: 'COP_APPLICATION', title: 'Apply for Certificate of Practice (Form 6)', isCompleted: true },
          { taskKey: 'FIRM_NAME_APPROVAL', title: 'Firm Name Approval on ICAI SSP Portal', isCompleted: true },
          { taskKey: 'MEF_REGISTRATION', title: 'Register for Multipurpose Empanelment (MEF)', isCompleted: false },
          { taskKey: 'UDIN_GENERATION', title: 'Setup UDIN Portal Credentials', isCompleted: true },
        ],
      });
    }
    if (path === 'practice/clients') {
      return NextResponse.json({
        success: true,
        data: [
          { id: 'cl-1', clientName: 'Vertex Financial Services Pvt Ltd', entityType: 'PVT_LTD', status: 'ACTIVE' },
          { id: 'cl-2', clientName: 'Apex Capital Advisors LLP', entityType: 'PARTNERSHIP', status: 'ACTIVE' },
        ],
      });
    }
    if (path === 'practice/tasks') {
      return NextResponse.json({
        success: true,
        data: [
          { id: 'tsk-1', clientName: 'Vertex Financial Services', taskTitle: 'GSTR-3B Monthly Filing', dueDate: '2026-11-20', status: 'PENDING' },
          { id: 'tsk-2', clientName: 'Apex Capital Advisors', taskTitle: 'Advance Tax Q3 Computation', dueDate: '2026-12-15', status: 'PENDING' },
        ],
      });
    }
  }

  // Default fallback for GET
  return NextResponse.json({
    success: true,
    data: {},
    message: `Serverless mock route for ${path}`,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug.join('/');
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // 1. Demo Login: /api/v1/auth/demo-login
  if (path === 'auth/demo-login') {
    const role = body.role || 'CANDIDATE';
    const isRecruiter = role === 'RECRUITER';
    const isAdmin = role === 'PLATFORM_ADMIN';

    return NextResponse.json({
      success: true,
      data: {
        accessToken: `demo-jwt-${role.toLowerCase()}-${Date.now()}`,
        defaultWorkspaceId: isRecruiter ? 'ws-org' : 'ws-personal',
        user: {
          id: `usr-${role.toLowerCase()}-01`,
          email: isRecruiter ? 'recruiter@big4firm.com' : isAdmin ? 'admin@charteredos.com' : 'priya.sharma@ca.in',
          firstName: isRecruiter ? 'Rohit' : isAdmin ? 'System' : 'Priya',
          lastName: isRecruiter ? 'Verma' : isAdmin ? 'Admin' : 'Sharma',
          role: role,
        },
      },
    });
  }

  // 2. Standard Login: /api/v1/auth/login
  if (path === 'auth/login') {
    return NextResponse.json({
      success: true,
      data: {
        accessToken: `jwt-candidate-${Date.now()}`,
        defaultWorkspaceId: 'ws-personal',
        user: {
          id: 'usr-candidate-01',
          email: body.email || 'candidate@charteredos.com',
          firstName: 'Priya',
          lastName: 'Sharma',
          role: 'CANDIDATE',
        },
      },
    });
  }

  // 3. Register: /api/v1/auth/register
  if (path === 'auth/register') {
    return NextResponse.json({
      success: true,
      data: {
        accessToken: `jwt-new-${Date.now()}`,
        defaultWorkspaceId: 'ws-personal',
        user: {
          id: `usr-${Date.now()}`,
          email: body.email,
          firstName: body.firstName || 'Candidate',
          lastName: body.lastName || '',
          role: body.role || 'CANDIDATE',
        },
      },
    });
  }

  // 4. Save Job: /api/v1/jobs/:id/save
  if (path.startsWith('jobs/') && path.endsWith('/save')) {
    const jobId = slug[1];
    savedJobsStore.add(jobId);
    return NextResponse.json({ success: true, message: 'Job saved successfully' });
  }

  // 5. Submit Application: /api/v1/applications
  if (path === 'applications') {
    const newApp = {
      id: `app-${Date.now()}`,
      jobId: body.jobId,
      status: body.status || 'APPLIED',
      appliedDate: new Date().toISOString().split('T')[0],
      coverNote: body.coverNote,
      nextFollowUpDate: body.nextFollowUpDate,
    };
    applicationsStore.unshift(newApp);
    return NextResponse.json({ success: true, data: newApp });
  }

  // 6. XML Sync: /api/v1/jobs/sources/xml/sync
  if (path === 'jobs/sources/xml/sync') {
    return NextResponse.json({
      success: true,
      message: 'Refreshed latest XML job listings from authentic feeds.',
      syncedCount: (jobsData as any[]).length,
    });
  }

  // 7. Career profile save: /api/v1/career/profile
  if (path === 'career/profile') {
    return NextResponse.json({
      success: true,
      data: { ...body, updatedAt: new Date().toISOString() },
    });
  }

  // Default fallback for POST
  return NextResponse.json({
    success: true,
    data: { id: `item-${Date.now()}`, ...body },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const path = slug.join('/');

  // Unsave job: /api/v1/jobs/:id/save
  if (path.startsWith('jobs/') && path.endsWith('/save')) {
    const jobId = slug[1];
    savedJobsStore.delete(jobId);
    return NextResponse.json({ success: true, message: 'Job unsaved successfully' });
  }

  return NextResponse.json({ success: true, message: 'Deleted' });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  return NextResponse.json({ success: true, data: body });
}
