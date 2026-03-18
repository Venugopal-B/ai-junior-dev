import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { aiApi } from '@/api/ai';
import { projectsApi } from '@/api/projects';
import { runsApi } from '@/api/runs';
import { CodeViewer } from '@/components/code/CodeViewer';
import { BugPanel } from '@/components/project/BugPanel';
import { ExplainPanel } from '@/components/project/ExplainPanel';
import { FixPanel } from '@/components/project/FixPanel';
import { TestPanel } from '@/components/project/TestPanel';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Toast } from '@/components/ui/Toast';
import { useFiles } from '@/hooks/useFiles';
import { formatDate, runTypeEmoji, runTypeLabel } from '@/lib/utils';
import {
  AIResult,
  AIRunResultsMap,
  AnalysisRun,
  Project,
  ProjectFile,
  RunType,
  UniversalRunResult,
} from '@/types';

type ViewTab = 'code' | RunType | 'history';
const RUN_POLL_INTERVAL_MS = 1500;
const RUN_POLL_MAX_ATTEMPTS = 80;

const AI_TABS: Array<{ tab: RunType; label: string; icon: string }> = [
  { tab: 'explain', label: 'Explain', icon: '📖' },
  { tab: 'analyze', label: 'Bugs', icon: '🐛' },
  { tab: 'generate-tests', label: 'Tests', icon: '🧪' },
  { tab: 'suggest-fix', label: 'Fixes', icon: '🔧' },
];

function isAITab(tab: ViewTab): tab is RunType {
  return AI_TABS.some(({ tab: runTab }) => runTab === tab);
}

function buildRunKey(fileId: string, tab: RunType): string {
  return `${fileId}-${tab}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isUniversalRunPayload(value: unknown): value is UniversalRunResult {
  return isRecord(value) && value.mode === 'universal' && isRecord(value.results);
}

function applyUniversalResults(
  previous: Record<string, AIResult>,
  fileId: string,
  result: UniversalRunResult
): Record<string, AIResult> {
  const next = { ...previous };

  for (const { tab } of AI_TABS) {
    next[buildRunKey(fileId, tab)] = result.results[tab];
  }

  return next;
}

function applyStoredRun(
  previous: Record<string, AIResult>,
  run: AnalysisRun
): Record<string, AIResult> {
  if (!run.file_id || run.status !== 'success') {
    return previous;
  }

  if (isUniversalRunPayload(run.raw_result_json)) {
    return applyUniversalResults(previous, run.file_id, run.raw_result_json);
  }

  return {
    ...previous,
    [buildRunKey(run.file_id, run.run_type)]: run.raw_result_json as unknown as AIResult,
  };
}

function historyIcon(run: AnalysisRun): string {
  return isUniversalRunPayload(run.raw_result_json) ? '⚡' : runTypeEmoji(run.run_type);
}

function historyLabel(run: AnalysisRun): string {
  return isUniversalRunPayload(run.raw_result_json) ? 'Full Analysis' : runTypeLabel(run.run_type);
}

function historyBadges(run: AnalysisRun): string[] {
  if (!isUniversalRunPayload(run.raw_result_json)) {
    return [runTypeLabel(run.run_type)];
  }

  return AI_TABS.map(({ label }) => label);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForRunCompletion(runId: string): Promise<AnalysisRun> {
  for (let attempt = 0; attempt < RUN_POLL_MAX_ATTEMPTS; attempt += 1) {
    const run = await runsApi.getById(runId);

    if (run.status === 'success' || run.status === 'failed') {
      return run;
    }

    await sleep(RUN_POLL_INTERVAL_MS);
  }

  throw new Error('Analysis is taking longer than expected. Check History in a moment.');
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const { files, loading: filesLoading, addFile, updateFileContent, deleteFile } = useFiles(id!);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('code');
  const [aiResults, setAiResults] = useState<Record<string, AIResult>>({});
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [runs, setRuns] = useState<AnalysisRun[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAddFile, setShowAddFile] = useState(false);
  const [newFile, setNewFile] = useState({ file_name: '', content: '', language: 'TypeScript' });
  const [addingFile, setAddingFile] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [savingFile, setSavingFile] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  const normalizeFileName = (fileName: string) => fileName.trim().toLowerCase();
  const hasDuplicateName = Boolean(
    newFile.file_name.trim() &&
    files.some((file) => normalizeFileName(file.file_name) === normalizeFileName(newFile.file_name))
  );
  const hasUnsavedChanges = Boolean(selectedFile && editorContent !== selectedFile.content);
  const currentResult =
    selectedFile && isAITab(activeTab) ? aiResults[buildRunKey(selectedFile.id, activeTab)] : undefined;

  useEffect(() => {
    if (!id) {
      return;
    }

    projectsApi.getById(id).then(setProject).catch(console.error);
    runsApi.listByProject(id).then(setRuns).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (files.length === 0) {
      setSelectedFile(null);
      return;
    }

    if (!selectedFile) {
      setSelectedFile(files[0]);
      return;
    }

    const nextSelectedFile = files.find((file) => file.id === selectedFile.id);
    if (!nextSelectedFile) {
      setSelectedFile(files[0]);
      return;
    }

    if (nextSelectedFile !== selectedFile) {
      setSelectedFile(nextSelectedFile);
    }
  }, [files, selectedFile]);

  useEffect(() => {
    setEditorContent(selectedFile?.content ?? '');
  }, [selectedFile?.id, selectedFile?.content]);

  useEffect(() => {
    if (files.length === 0 || runs.length === 0) {
      return;
    }

    const existingFileIds = new Set(files.map((file) => file.id));

    setAiResults((previous) => {
      let next = { ...previous };

      for (const run of [...runs].reverse()) {
        if (run.file_id && existingFileIds.has(run.file_id)) {
          next = applyStoredRun(next, run);
        }
      }

      return next;
    });
  }, [files, runs]);

  const handleSelectFile = (file: ProjectFile) => {
    if (selectedFile?.id === file.id) {
      return;
    }

    if (hasUnsavedChanges && !window.confirm('Discard unsaved changes and switch files?')) {
      return;
    }

    setSelectedFile(file);
    setActiveTab('code');
  };

  const saveCurrentFile = async (options?: { silent?: boolean }): Promise<ProjectFile> => {
    if (!selectedFile) {
      throw new Error('Select a file before saving.');
    }

    if (!hasUnsavedChanges) {
      return selectedFile;
    }

    setSavingFile(true);

    try {
      const updatedFile = await updateFileContent(selectedFile.id, editorContent);
      setSelectedFile(updatedFile);

      if (!options?.silent) {
        setToast({ message: 'File saved!', type: 'success' });
      }

      return updatedFile;
    } finally {
      setSavingFile(false);
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFile || !hasUnsavedChanges) {
      return;
    }

    try {
      await saveCurrentFile();
    } catch (err) {
      setToast({ message: (err as Error).message, type: 'error' });
    }
  };

  const handleUniversalRun = async () => {
    if (!selectedFile || !id) {
      return;
    }

    setIsRunningAll(true);
    setActiveTab('explain');

    try {
      const fileToRun = hasUnsavedChanges ? await saveCurrentFile({ silent: true }) : selectedFile;
      const queuedRun = await aiApi.runAllAsync(id, fileToRun.id);

      setRuns((previous) => [queuedRun.run, ...previous.filter((run) => run.id !== queuedRun.run.id)]);
      setToast({ message: 'Full analysis started in background...', type: 'success' });

      const completedRun = await waitForRunCompletion(queuedRun.run.id);
      setRuns((previous) => [completedRun, ...previous.filter((run) => run.id !== completedRun.id)]);

      if (completedRun.status === 'failed') {
        throw new Error(completedRun.output_summary || 'Full analysis failed');
      }

      if (!completedRun.file_id || !isUniversalRunPayload(completedRun.raw_result_json)) {
        throw new Error('Run completed, but the universal analysis payload was missing.');
      }

      const completedFileId = completedRun.file_id as string;
      const universalResult = completedRun.raw_result_json as UniversalRunResult;
      setAiResults((previous) =>
        applyUniversalResults(previous, completedFileId, universalResult)
      );
      setToast({ message: 'Full analysis complete!', type: 'success' });
    } catch (err) {
      setToast({ message: (err as Error).message, type: 'error' });
    } finally {
      setIsRunningAll(false);
    }
  };

  const handleAddFile = async () => {
    if (!newFile.file_name || !id) {
      return;
    }

    if (hasDuplicateName) {
      setToast({ message: 'A file with that name already exists in this project', type: 'error' });
      return;
    }

    setAddingFile(true);

    try {
      const file = await addFile({
        file_name: newFile.file_name.trim(),
        content: newFile.content,
        language: newFile.language,
      });

      setSelectedFile(file);
      setActiveTab('code');
      setShowAddFile(false);
      setNewFile({ file_name: '', content: '', language: 'TypeScript' });
      setToast({ message: 'File added!', type: 'success' });
    } catch (err) {
      setToast({ message: (err as Error).message, type: 'error' });
    } finally {
      setAddingFile(false);
    }
  };

  const handleDeleteFile = async (file: ProjectFile) => {
    if (!window.confirm(`Delete ${file.file_name}? This cannot be undone.`)) {
      return;
    }

    setDeletingFileId(file.id);

    try {
      await deleteFile(file.id);
      setAiResults((previous) => {
        const next = { ...previous };

        for (const key of Object.keys(next)) {
          if (key.startsWith(`${file.id}-`)) {
            delete next[key];
          }
        }

        return next;
      });
      setToast({ message: 'File deleted!', type: 'success' });
    } catch (err) {
      setToast({ message: (err as Error).message, type: 'error' });
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleOpenRun = (run: AnalysisRun) => {
    if (run.status !== 'success' || !run.file_id) {
      return;
    }

    const file = files.find((item) => item.id === run.file_id);
    if (!file) {
      setToast({ message: 'This file is no longer available in the project.', type: 'error' });
      return;
    }

    setSelectedFile(file);
    setAiResults((previous) => applyStoredRun(previous, run));
    setActiveTab(isUniversalRunPayload(run.raw_result_json) ? 'explain' : run.run_type);
  };

  const renderResult = () => {
    if (!isAITab(activeTab)) {
      return null;
    }

    if (!currentResult) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-[#555d70]">
          <span className="mb-3 text-3xl">{runTypeEmoji(activeTab)}</span>
          <p className="text-sm">Click RUN to load explanation, bugs, tests, and fixes for this file.</p>
        </div>
      );
    }

    if (activeTab === 'explain') {
      return <ExplainPanel result={currentResult as AIRunResultsMap['explain']} />;
    }

    if (activeTab === 'analyze') {
      return <BugPanel result={currentResult as AIRunResultsMap['analyze']} />;
    }

    if (activeTab === 'generate-tests') {
      return <TestPanel result={currentResult as AIRunResultsMap['generate-tests']} />;
    }

    return <FixPanel result={currentResult as AIRunResultsMap['suggest-fix']} />;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0b0e] text-[#e8eaf0]">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="w-[240px] min-w-[240px] border-r border-[rgba(255,255,255,0.07)] bg-[#111318]">
        <div className="border-b border-[rgba(255,255,255,0.07)] px-4 py-5">
          <div className="mb-3 flex items-center gap-2 font-display font-bold text-[#e8eaf0]">
            <span className="h-2 w-2 rounded-full bg-[#4f8ef7]" />
            <span>DevAssist AI</span>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="mb-2 flex items-center gap-1 text-xs text-[#8a90a0] transition-colors hover:text-[#e8eaf0]"
          >
            ← Dashboard
          </button>

          {project && (
            <>
              <p className="truncate font-mono text-sm font-semibold text-[#e8eaf0]">{project.name}</p>
              <Badge variant="blue" className="mt-1 text-[10px]">
                {project.primary_language}
              </Badge>
            </>
          )}
        </div>

        <div className="flex h-[calc(100vh-110px)] flex-col overflow-hidden">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-[#555d70]">Files</div>

          <div className="flex-1 overflow-y-auto">
            {filesLoading ? (
              <div className="flex justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : (
              files.map((file) => (
                <div
                  key={file.id}
                  className={`group flex items-center gap-1 px-2 py-1 ${
                    selectedFile?.id === file.id
                      ? 'border-r-2 border-[#4f8ef7] bg-[#4f8ef7]/10'
                      : 'hover:bg-[#181c24]'
                  }`}
                >
                  <button
                    onClick={() => handleSelectFile(file)}
                    className={`flex min-w-0 flex-1 items-center gap-1.5 px-1 py-1 text-left text-xs font-mono transition-all ${
                      selectedFile?.id === file.id
                        ? 'text-[#4f8ef7]'
                        : 'text-[#8a90a0] group-hover:text-[#e8eaf0]'
                    }`}
                  >
                    <span>📄</span>
                    <span className="truncate">{file.file_name}</span>
                  </button>

                  <button
                    type="button"
                    aria-label={`Delete ${file.file_name}`}
                    disabled={deletingFileId === file.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleDeleteFile(file);
                    }}
                    className="rounded px-1.5 py-1 text-[10px] text-[#555d70] opacity-0 transition-all hover:bg-[#2a1111] hover:text-[#f07474] disabled:opacity-60 group-hover:opacity-100"
                  >
                    {deletingFileId === file.id ? '...' : 'Del'}
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setShowAddFile(true)}
            className="mt-1 flex w-full items-center gap-1.5 border-t border-[rgba(255,255,255,0.07)] px-3 py-2 text-xs text-[#555d70] transition-colors hover:text-[#4f8ef7]"
          >
            + Add file
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.07)] bg-[#0a0b0e] px-2 sm:px-4">
          <div className="flex min-w-0 flex-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('code')}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-all ${
                activeTab === 'code'
                  ? 'border-[#4f8ef7] text-[#e8eaf0]'
                  : 'border-transparent text-[#8a90a0] hover:text-[#e8eaf0]'
              }`}
            >
              📝 Code
            </button>

            {AI_TABS.map(({ tab, label, icon }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-all ${
                  activeTab === tab
                    ? 'border-[#4f8ef7] text-[#e8eaf0]'
                    : 'border-transparent text-[#8a90a0] hover:text-[#e8eaf0]'
                }`}
              >
                {icon} {label}
              </button>
            ))}

            <button
              onClick={() => setActiveTab('history')}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm transition-all ${
                activeTab === 'history'
                  ? 'border-[#4f8ef7] text-[#e8eaf0]'
                  : 'border-transparent text-[#8a90a0] hover:text-[#e8eaf0]'
              }`}
            >
              📋 History
            </button>
          </div>

          <Button
            size="sm"
            className="shrink-0 uppercase tracking-[0.24em]"
            loading={isRunningAll}
            disabled={!selectedFile || isRunningAll || savingFile}
            onClick={() => void handleUniversalRun()}
          >
            RUN
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'code' &&
            (selectedFile ? (
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.07)] bg-[#0a0b0e] px-4 py-2.5">
                  <span className="text-xs text-[#8a90a0]">
                    Editing: <span className="font-mono text-[#e8eaf0]">{selectedFile.file_name}</span>
                  </span>

                  {hasUnsavedChanges && (
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                      Unsaved
                    </span>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto"
                    disabled={!hasUnsavedChanges || savingFile}
                    onClick={() => setEditorContent(selectedFile.content)}
                  >
                    Revert
                  </Button>

                  <Button
                    size="sm"
                    loading={savingFile}
                    disabled={!hasUnsavedChanges}
                    onClick={() => void handleSaveFile()}
                  >
                    Save File
                  </Button>
                </div>

                <CodeViewer value={editorContent} onChange={setEditorContent} />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-[#555d70]">Select a file to view</div>
            ))}

          {activeTab === 'history' && (
            <div className="h-full overflow-y-auto p-4">
              {runs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-[#555d70]">
                  <span className="mb-3 text-3xl">📋</span>
                  <p className="text-sm">No runs yet</p>
                </div>
              ) : (
                <div className="space-y-4 pb-4">
                  {runs.map((run) => {
                    const fileStillExists = Boolean(run.file_id && files.some((file) => file.id === run.file_id));

                    return (
                      <div
                        key={run.id}
                        className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#111318] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                      >
                        <div className="flex items-start gap-4">
                          <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg bg-[#181c24] text-lg">
                            {historyIcon(run)}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-[#e8eaf0]">{historyLabel(run)}</p>

                              {historyBadges(run).map((label) => (
                                <Badge key={`${run.id}-${label}`} variant="gray">
                                  {label}
                                </Badge>
                              ))}
                            </div>

                            <p className="mt-2 text-xs text-[#8a90a0]">{run.input_summary}</p>

                            <div className="mt-3 border-t border-[rgba(255,255,255,0.06)] pt-3">
                              <p className="text-xs leading-relaxed text-[#555d70]">
                                {run.output_summary} | {formatDate(run.created_at)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3 self-stretch">
                            <Badge
                              variant={
                                run.status === 'success'
                                  ? 'green'
                                  : run.status === 'failed'
                                    ? 'red'
                                    : 'gray'
                              }
                            >
                              {run.status}
                            </Badge>

                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={run.status !== 'success' || !fileStillExists}
                              onClick={() => handleOpenRun(run)}
                            >
                              Open
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {isAITab(activeTab) && (
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.07)] bg-[#0a0b0e] px-4 py-2.5">
                <span className="text-xs text-[#8a90a0]">
                  Analyzing: <span className="font-mono text-[#e8eaf0]">{selectedFile?.file_name ?? 'no file selected'}</span>
                </span>

                <span className="ml-auto text-[11px] text-[#555d70]">
                  RUN refreshes explanation, bugs, tests, and fixes together.
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {isRunningAll ? (
                  <div className="flex items-center gap-3 py-4 text-[#4f8ef7]">
                    <Spinner size="sm" />
                    <span className="text-sm">AI is running the full analysis...</span>
                  </div>
                ) : (
                  renderResult()
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showAddFile}
        onClose={() => setShowAddFile(false)}
        title="Add File"
        subtitle="Add a code file to this project."
      >
        <div className="space-y-4">
          <Input
            label="File Name"
            placeholder="utils.ts"
            value={newFile.file_name}
            onChange={(event) => setNewFile({ ...newFile, file_name: event.target.value })}
          />

          {hasDuplicateName && (
            <p className="text-xs text-[#f07474]">
              A file with this exact name already exists. Use a different filename or extension.
            </p>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#8a90a0]">Language</label>
            <select
              className="w-full rounded-md border border-[rgba(255,255,255,0.12)] bg-[#181c24] px-3 py-2.5 text-sm text-[#e8eaf0] outline-none"
              value={newFile.language}
              onChange={(event) => setNewFile({ ...newFile, language: event.target.value })}
            >
              {['TypeScript', 'JavaScript', 'Python', 'Go', 'Rust', 'Java'].map((language) => (
                <option key={language}>{language}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[#8a90a0]">Code</label>
            <textarea
              className="min-h-[160px] w-full resize-y rounded-md border border-[rgba(255,255,255,0.12)] bg-[#181c24] px-3 py-2.5 font-mono text-xs leading-relaxed text-[#e8eaf0] outline-none transition-colors focus:border-[#4f8ef7]"
              placeholder="// Paste your code here..."
              value={newFile.content}
              onChange={(event) => setNewFile({ ...newFile, content: event.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowAddFile(false)}>
              Cancel
            </Button>
            <Button
              loading={addingFile}
              disabled={!newFile.file_name.trim() || hasDuplicateName}
              onClick={() => void handleAddFile()}
            >
              Add File
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
