import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { runsApi } from '@/api/runs';
import { Sidebar } from '@/components/layout/Sidebar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { useProjects } from '@/hooks/useProjects';
import { formatDate, runTypeEmoji, runTypeLabel } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { AnalysisRun, RunHistoryItem } from '@/types';

const LANGUAGES = ['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java', 'C#', 'Ruby'];

type DashboardSection = 'overview' | 'projects' | 'history' | 'settings';

function getSectionFromPath(pathname: string): DashboardSection {
  if (pathname.startsWith('/dashboard/projects')) {
    return 'projects';
  }

  if (pathname.startsWith('/dashboard/history')) {
    return 'history';
  }

  if (pathname.startsWith('/dashboard/settings')) {
    return 'settings';
  }

  return 'overview';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isUniversalRunPayload(value: unknown): boolean {
  return isRecord(value) && value.mode === 'universal' && isRecord(value.results);
}

function langBadgeVariant(lang: string) {
  const variants: Record<string, 'blue' | 'amber' | 'green' | 'purple' | 'gray'> = {
    TypeScript: 'blue',
    JavaScript: 'amber',
    Python: 'green',
    Go: 'blue',
    Rust: 'amber',
  };

  return variants[lang] ?? 'gray';
}

function statusBadgeVariant(status: AnalysisRun['status']) {
  if (status === 'success') {
    return 'green';
  }

  if (status === 'failed') {
    return 'red';
  }

  return 'gray';
}

function historyLabel(run: AnalysisRun): string {
  return isUniversalRunPayload(run.raw_result_json) ? 'Full Analysis' : runTypeLabel(run.run_type);
}

function historyIcon(run: AnalysisRun): string {
  return isUniversalRunPayload(run.raw_result_json) ? '⚡' : runTypeEmoji(run.run_type);
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[rgba(255,255,255,0.12)] bg-[#111318] px-6 py-10 text-center">
      <h3 className="font-display text-lg font-semibold text-[#e8eaf0]">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#8a90a0]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export default function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const section = getSectionFromPath(location.pathname);
  const { user, logout } = useAuthStore();
  const { projects, loading, createProject } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', primary_language: 'TypeScript' });
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [historyRuns, setHistoryRuns] = useState<RunHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const runs = await runsApi.listAll();

        if (!cancelled) {
          setHistoryRuns(runs);
        }
      } catch (err) {
        if (!cancelled) {
          setHistoryError((err as Error).message);
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(
    () => [
      { label: 'Total Projects', value: projects.length, color: 'text-[#e8eaf0]' },
      { label: 'Total Runs', value: historyRuns.length, color: 'text-[#e8eaf0]' },
      { label: 'Files Analyzed', value: projects.reduce((sum, project) => sum + (project.file_count ?? 0), 0), color: 'text-[#34d97b]' },
      { label: 'Languages Used', value: new Set(projects.map((project) => project.primary_language)).size, color: 'text-[#4f8ef7]' },
    ],
    [historyRuns.length, projects]
  );

  const recentProjects = projects.slice(0, 3);
  const recentRuns = historyRuns.slice(0, 6);

  const sectionMeta: Record<DashboardSection, { title: string; subtitle: string }> = {
    overview: {
      title: 'Dashboard',
      subtitle: 'Your workspace summary, latest activity, and quickest way back into a project.',
    },
    projects: {
      title: 'Projects',
      subtitle: 'Browse all projects, jump into code, and create a new workspace when you need one.',
    },
    history: {
      title: 'Run History',
      subtitle: 'Recent analysis activity across every project in your account.',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Account details and quick workspace actions.',
    },
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      return;
    }

    setCreating(true);

    try {
      await createProject({
        name: form.name,
        description: form.description || undefined,
        primary_language: form.primary_language,
      });
      setShowModal(false);
      setForm({ name: '', description: '', primary_language: 'TypeScript' });
      setToast({ message: 'Project created!', type: 'success' });
      navigate('/dashboard/projects');
    } catch (err) {
      setToast({ message: (err as Error).message, type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const renderProjectsGrid = (items: typeof projects) => {
    if (loading) {
      return (
        <div className="flex items-center gap-3 py-8 text-[#8a90a0]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[rgba(255,255,255,0.12)] border-t-[#4f8ef7]" />
          Loading projects...
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start running explanations, bug checks, tests, and fix suggestions."
          action={<Button onClick={() => setShowModal(true)}>Create Project</Button>}
        />
      );
    }

    return (
      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((project) => (
          <div
            key={project.id}
            onClick={() => navigate(`/project/${project.id}`)}
            className="group cursor-pointer rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#111318] p-5 transition-all hover:-translate-y-0.5 hover:border-[#4f8ef7]"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="truncate font-display font-semibold text-[#e8eaf0] transition-colors group-hover:text-[#4f8ef7]">
                {project.name}
              </h3>
              <Badge variant={langBadgeVariant(project.primary_language)} className="flex-shrink-0">
                {project.primary_language}
              </Badge>
            </div>

            <p className="mb-4 min-h-[40px] text-xs leading-relaxed text-[#8a90a0]">
              {project.description ?? 'No description provided yet.'}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gray">{project.file_count ?? 0} files</Badge>
              <Badge variant="gray">{project.run_count ?? 0} runs</Badge>
              <span className="ml-auto text-[10px] text-[#555d70]">{formatDate(project.created_at)}</span>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex min-h-[170px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[rgba(255,255,255,0.14)] bg-transparent p-5 text-[#555d70] transition-all hover:border-[#4f8ef7] hover:text-[#4f8ef7]"
        >
          <span className="text-2xl">+</span>
          <span className="text-sm">New Project</span>
        </button>
      </div>
    );
  };

  const renderHistoryList = (items: RunHistoryItem[], limit?: number) => {
    if (historyLoading) {
      return (
        <div className="flex items-center gap-3 py-8 text-[#8a90a0]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[rgba(255,255,255,0.12)] border-t-[#4f8ef7]" />
          Loading run history...
        </div>
      );
    }

    if (historyError) {
      return (
        <EmptyState
          title="Couldn't load run history"
          description={historyError}
          action={<Button variant="ghost" onClick={() => navigate('/dashboard/projects')}>Go To Projects</Button>}
        />
      );
    }

    if (items.length === 0) {
      return (
        <EmptyState
          title="No analysis runs yet"
          description="Once you run code analysis in any project, the activity will show up here."
          action={<Button onClick={() => navigate('/dashboard/projects')}>Open Projects</Button>}
        />
      );
    }

    return (
      <div className="space-y-4">
        {items.slice(0, limit ?? items.length).map((run) => (
          <div
            key={run.id}
            className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#111318] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#181c24] text-lg">
                {historyIcon(run)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-[#e8eaf0]">{historyLabel(run)}</p>
                  <Badge variant={langBadgeVariant(run.project_language)}>{run.project_language}</Badge>
                  <Badge variant="gray">{run.project_name}</Badge>
                </div>

                <p className="mt-2 text-xs text-[#8a90a0]">{run.input_summary}</p>
                <p className="mt-3 border-t border-[rgba(255,255,255,0.06)] pt-3 text-xs leading-relaxed text-[#555d70]">
                  {run.output_summary} | {formatDate(run.created_at)}
                </p>
              </div>

              <div className="flex flex-row items-center gap-2 md:flex-col md:items-end">
                <Badge variant={statusBadgeVariant(run.status)}>{run.status}</Badge>
                <Button size="sm" variant="ghost" onClick={() => navigate(`/project/${run.project_id}`)}>
                  Open Project
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#111318] p-5">
            <p className="mb-1 text-xs text-[#555d70]">{stat.label}</p>
            <p className={`font-display text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-[#e8eaf0]">Recent Projects</h2>
          <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/projects')}>
            View All
          </Button>
        </div>
        {renderProjectsGrid(recentProjects)}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-[#e8eaf0]">Recent Runs</h2>
          <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/history')}>
            View History
          </Button>
        </div>
        {renderHistoryList(recentRuns, 5)}
      </section>
    </div>
  );

  const renderProjectsSection = () => (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-[#e8eaf0]">All Projects</h2>
        <span className="text-xs text-[#555d70]">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </span>
      </div>
      {renderProjectsGrid(projects)}
    </section>
  );

  const renderHistorySection = () => (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-[#e8eaf0]">All Runs</h2>
        <span className="text-xs text-[#555d70]">
          {historyRuns.length} run{historyRuns.length !== 1 ? 's' : ''}
        </span>
      </div>
      {renderHistoryList(historyRuns)}
    </section>
  );

  const renderSettingsSection = () => (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <section className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#111318] p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#555d70]">Profile</p>
        <div className="mt-5 flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4f8ef7] to-[#7c5cf7] text-xl font-semibold text-white">
            {user?.name?.charAt(0) ?? 'U'}
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-[#e8eaf0]">{user?.name ?? 'User'}</h2>
            <p className="mt-1 text-sm text-[#8a90a0]">{user?.email ?? 'No email available'}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-[#181c24] p-4">
            <p className="text-[11px] uppercase tracking-widest text-[#555d70]">Projects</p>
            <p className="mt-2 font-display text-2xl font-bold text-[#e8eaf0]">{projects.length}</p>
          </div>
          <div className="rounded-xl bg-[#181c24] p-4">
            <p className="text-[11px] uppercase tracking-widest text-[#555d70]">Runs</p>
            <p className="mt-2 font-display text-2xl font-bold text-[#4f8ef7]">{historyRuns.length}</p>
          </div>
          <div className="rounded-xl bg-[#181c24] p-4">
            <p className="text-[11px] uppercase tracking-widest text-[#555d70]">Session</p>
            <p className="mt-2 font-display text-2xl font-bold text-[#34d97b]">Active</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#0f1218] p-4">
          <p className="text-sm font-medium text-[#e8eaf0]">Account actions</p>
          <p className="mt-1 text-xs leading-relaxed text-[#8a90a0]">
            Quick links for the parts of the app you use most often.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button size="sm" onClick={() => navigate('/dashboard/projects')}>
              Open Projects
            </Button>
            <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/history')}>
              View Run History
            </Button>
            <Button size="sm" variant="danger" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#111318] p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#555d70]">Workspace</p>
          <p className="mt-3 text-sm leading-relaxed text-[#8a90a0]">
            Dashboard navigation is now split into real sections. Use Projects for workspaces, Run History for cross-project activity, and this panel for account-level actions.
          </p>
        </div>

        <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#111318] p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#555d70]">Need a fresh start?</p>
          <p className="mt-3 text-sm leading-relaxed text-[#8a90a0]">
            Create a new project directly from here and jump back into analysis without leaving settings.
          </p>
          <Button className="mt-4" size="sm" onClick={() => setShowModal(true)}>
            + New Project
          </Button>
        </div>
      </aside>
    </div>
  );

  const renderSection = () => {
    if (section === 'projects') {
      return renderProjectsSection();
    }

    if (section === 'history') {
      return renderHistorySection();
    }

    if (section === 'settings') {
      return renderSettingsSection();
    }

    return renderOverview();
  };

  const headerAction = () => {
    if (section === 'history') {
      return (
        <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard/projects')}>
          Open Projects
        </Button>
      );
    }

    if (section === 'settings') {
      return (
        <Button size="sm" variant="danger" onClick={handleSignOut}>
          Sign out
        </Button>
      );
    }

    return (
      <Button size="sm" onClick={() => setShowModal(true)}>
        + New Project
      </Button>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0b0e] text-[#e8eaf0]">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-[rgba(255,255,255,0.07)] bg-[#0a0b0e] px-6 py-4">
          <div>
            <h1 className="font-display text-xl font-semibold text-[#e8eaf0]">{sectionMeta[section].title}</h1>
            <p className="mt-1 text-sm text-[#8a90a0]">{sectionMeta[section].subtitle}</p>
          </div>
          {headerAction()}
        </header>

        <main className="flex-1 overflow-y-auto p-6">{renderSection()}</main>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Project"
        subtitle="Set up a new workspace for your code analysis."
      >
        <div className="space-y-4">
          <Input
            label="Project Name *"
            placeholder="my-awesome-project"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <Input
            label="Description"
            placeholder="Brief description..."
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#8a90a0]">Primary Language</label>
            <select
              className="w-full rounded-md border border-[rgba(255,255,255,0.12)] bg-[#181c24] px-3 py-2.5 text-sm text-[#e8eaf0] outline-none"
              value={form.primary_language}
              onChange={(event) => setForm({ ...form, primary_language: event.target.value })}
            >
              {LANGUAGES.map((language) => (
                <option key={language}>{language}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={creating} disabled={!form.name.trim()}>
              Create Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
