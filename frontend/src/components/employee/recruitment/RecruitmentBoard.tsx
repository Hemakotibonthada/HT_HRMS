import { useMemo, useCallback, type ComponentProps } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchJobOpenings,
  fetchRecruitmentPipeline,
  createJobOpening,
  updateJobOpening,
  fetchJobWithCandidates,
  createCandidate,
  updateCandidate,
} from '../../../api/recruitment';
import type {
  JobOpeningSummary,
  RecruitmentPipelineSummary,
  JobWithCandidates,
  CandidateApplicationRecord,
  JobOpeningPayload,
  CandidatePayload,
  UpdateCandidatePayload,
  RecruitmentStage,
  JobStatus,
} from '../../../types/api';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { LoadingState } from '../../ui/LoadingState.tsx';
import { ErrorState } from '../../ui/ErrorState.tsx';
import { EmptyState } from '../../ui/EmptyState.tsx';
import { Modal } from '../../ui/Modal.tsx';
import { useModal } from '../../../hooks/useModal.ts';
import { JobForm } from './JobForm.tsx';
import { CandidateForm } from './CandidateForm.tsx';
import { StageBadge } from './StageBadge.tsx';
import { DataTable } from '../../ui/DataTable.tsx';
import type { DataTableColumn } from '../../ui/DataTable.tsx';

type PipelineColumn = {
  stage: RecruitmentStage;
  label: string;
};

const pipelineColumns: PipelineColumn[] = [
  { stage: 'APPLIED', label: 'Applied' },
  { stage: 'SCREENING', label: 'Screening' },
  { stage: 'INTERVIEW', label: 'Interview' },
  { stage: 'OFFER', label: 'Offer' },
  { stage: 'HIRED', label: 'Hired' },
  { stage: 'ARCHIVED', label: 'Archived' },
];

type CandidateFormValues = Parameters<ComponentProps<typeof CandidateForm>['onSubmit']>[0];

export const RecruitmentBoard = () => {
  const queryClient = useQueryClient();

  const jobsQuery = useQuery<JobOpeningSummary[]>({
    queryKey: ['recruitment', 'jobs'],
    queryFn: () => fetchJobOpenings(),
  });

  const pipelineQuery = useQuery<RecruitmentPipelineSummary[]>({
    queryKey: ['recruitment', 'pipeline'],
    queryFn: () => fetchRecruitmentPipeline(),
  });

  const [jobModal, openJobModal, closeJobModal] = useModal<JobOpeningSummary | undefined>();
  const [candidateModal, openCandidateModal, closeCandidateModal] = useModal<{
    jobId: string;
    candidate?: CandidateApplicationRecord;
  }>();
  const [jobDetailModal, openJobDetailModal, closeJobDetailModal] = useModal<{ jobId: string }>();

  const createJob = useMutation({
    mutationFn: (payload: JobOpeningPayload) => createJobOpening(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment'] });
      closeJobModal();
    },
  });

  const updateJob = useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: Partial<JobOpeningPayload> }) =>
      updateJobOpening(jobId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruitment'] });
      closeJobModal();
    },
  });

  const createCandidateMutation = useMutation({
    mutationFn: ({ jobId, payload }: { jobId: string; payload: CandidatePayload }) =>
      createCandidate(jobId, payload),
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ['recruitment', 'pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment', 'jobs'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment', 'jobs', jobId] });
      closeCandidateModal();
    },
  });

  const updateCandidateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCandidatePayload }) =>
      updateCandidate(id, payload),
    onSuccess: (_, { id, payload }) => {
      queryClient.invalidateQueries({ queryKey: ['recruitment', 'pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment', 'jobs'] });
      if (payload.stage) {
        queryClient.invalidateQueries({ queryKey: ['recruitment', 'candidate', id] });
      }
      closeCandidateModal();
    },
  });

  const jobDetailsQuery = useQuery<JobWithCandidates | null>({
    queryKey: ['recruitment', 'jobs', jobDetailModal.data?.jobId],
    queryFn: () =>
      jobDetailModal.data?.jobId
        ? fetchJobWithCandidates(jobDetailModal.data.jobId)
        : Promise.resolve(null),
    enabled: !!jobDetailModal.data?.jobId,
  });

  const openNewJob = useCallback(() => openJobModal(undefined), [openJobModal]);
  const openEditJob = useCallback(
    (job: JobOpeningSummary) =>
      openJobModal({
        ...job,
        stageSummary: job.stageSummary,
      }),
    [openJobModal]
  );

  const openNewCandidate = useCallback((jobId: string) => openCandidateModal({ jobId }), [openCandidateModal]);

  const openCandidateEdit = useCallback(
    (candidate: CandidateApplicationRecord) =>
      openCandidateModal({ jobId: candidate.jobId, candidate }),
    [openCandidateModal]
  );

  const openJobDetails = useCallback((jobId: string) => openJobDetailModal({ jobId }), [openJobDetailModal]);

  const pipelineData = useMemo(() => pipelineQuery.data ?? [], [pipelineQuery.data]);
  const jobInitialValues = useMemo(() => {
    if (!jobModal.data) return undefined;
    return {
      title: jobModal.data.title,
      department: jobModal.data.department,
      location: jobModal.data.location ?? undefined,
      description: jobModal.data.description ?? undefined,
      employmentType: jobModal.data.employmentType,
      status: jobModal.data.status,
      openings: jobModal.data.openings,
    } satisfies Partial<JobOpeningPayload> & { status?: JobStatus };
  }, [jobModal.data]);
  const jobTableColumns: DataTableColumn<JobOpeningSummary>[] = useMemo(
    () => [
      {
        header: 'Title',
        accessorKey: 'title',
      },
      {
        header: 'Department',
        accessorKey: 'department',
      },
      {
        header: 'Status',
        cell: (row: JobOpeningSummary) => <StageBadge stage={row.status} />,
      },
      {
        header: 'Candidates',
        cell: (row: JobOpeningSummary) => row.totalCandidates,
      },
      {
        header: 'Last Updated',
        cell: (row: JobOpeningSummary) => new Date(row.updatedAt).toLocaleDateString(),
      },
      {
        header: 'Actions',
        cell: (row: JobOpeningSummary) => (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => openEditJob(row)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => openJobDetails(row.id)}>
              Details
            </Button>
          </div>
        ),
      },
    ],
    [openEditJob, openJobDetails]
  );

  const candidateTableColumns: DataTableColumn<CandidateApplicationRecord>[] = useMemo(
    () => [
      {
        header: 'Name',
        cell: (row: CandidateApplicationRecord) => `${row.firstName} ${row.lastName}`,
      },
      {
        header: 'Email',
        accessorKey: 'email',
      },
      {
        header: 'Stage',
        cell: (row: CandidateApplicationRecord) => <StageBadge stage={row.stage} />,
      },
      {
        header: 'Last Interaction',
        cell: (row: CandidateApplicationRecord) =>
          row.lastInteraction ? new Date(row.lastInteraction).toLocaleDateString() : '—',
      },
      {
        header: 'Notes',
        cell: (row: CandidateApplicationRecord) => row.notes ?? '—',
      },
      {
        header: 'Actions',
        cell: (row: CandidateApplicationRecord) => (
          <Button size="sm" variant="ghost" onClick={() => openCandidateEdit(row)}>
            Update
          </Button>
        ),
      },
    ],
    [openCandidateEdit]
  );

  if (jobsQuery.isLoading || pipelineQuery.isLoading) {
    return <LoadingState title="Loading recruitment data" />;
  }

  if (jobsQuery.isError || pipelineQuery.isError) {
    return (
      <ErrorState
        title="Failed to load recruitment data"
        onRetry={() => {
          queryClient.invalidateQueries({ queryKey: ['recruitment'] });
        }}
      />
    );
  }

  const jobs = jobsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Recruitment</h2>
          <p className="text-sm text-muted-foreground">
            Track job openings, candidate pipeline, and hiring progress.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openNewJob}>Post Job</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pipelineData.map((job) => (
          <Card key={job.id} className="p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-base">{job.title}</h3>
                <p className="text-sm text-muted-foreground">{job.department}</p>
              </div>
              <StageBadge stage={job.status} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Openings</p>
                <p className="font-medium">{job.openings}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Candidates</p>
                <p className="font-medium">{job.totals.totalCandidates}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last update</p>
                <p className="font-medium">
                  {job.totals.lastCandidateAt
                    ? new Date(job.totals.lastCandidateAt).toLocaleDateString()
                    : '—'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs bg-muted rounded-md p-3">
              {pipelineColumns.slice(0, 3).map((column) => (
                <div key={column.stage} className="flex flex-col">
                  <span className="text-muted-foreground">{column.label}</span>
                  <span className="font-semibold">{job.totals.stageBreakdown[column.stage] ?? 0}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs bg-muted rounded-md p-3">
              {pipelineColumns.slice(3).map((column) => (
                <div key={column.stage} className="flex flex-col">
                  <span className="text-muted-foreground">{column.label}</span>
                  <span className="font-semibold">{job.totals.stageBreakdown[column.stage] ?? 0}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-auto">
              <Button variant="outline" size="sm" onClick={() => openNewCandidate(job.id)}>
                Add Candidate
              </Button>
              <Button variant="secondary" size="sm" onClick={() => openJobDetails(job.id)}>
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Job Openings</h3>
            <p className="text-sm text-muted-foreground">Manage job postings and hiring priorities.</p>
          </div>
          <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ['recruitment'] })}>
            Refresh
          </Button>
        </div>
        {jobs.length === 0 ? (
          <EmptyState
            title="No job openings"
            description="Create a job posting to start receiving candidates."
            actionLabel="Create Job"
            onAction={openNewJob}
          />
        ) : (
          <DataTable
            data={jobs}
            getRowId={(row: JobOpeningSummary) => row.id}
            columns={jobTableColumns}
          />
        )}
      </Card>

      <Modal open={jobModal.isOpen} onOpenChange={closeJobModal} title={jobModal.data ? 'Edit Job' : 'New Job'}>
        <JobForm
          initialValues={jobInitialValues}
          isSubmitting={createJob.isPending || updateJob.isPending}
          onSubmit={(values: JobOpeningPayload) => {
            if (jobModal.data?.id) {
              updateJob.mutate({ jobId: jobModal.data.id, payload: values });
            } else {
              createJob.mutate(values);
            }
          }}
        />
      </Modal>

      <Modal open={candidateModal.isOpen} onOpenChange={closeCandidateModal} title={candidateModal.data?.candidate ? 'Update Candidate' : 'New Candidate'}>
        <CandidateForm
          initialValues={candidateModal.data?.candidate}
          isSubmitting={createCandidateMutation.isPending || updateCandidateMutation.isPending}
          onSubmit={async (values: CandidateFormValues) => {
            if (candidateModal.data?.candidate) {
              await updateCandidateMutation.mutateAsync({
                id: candidateModal.data.candidate.id,
                payload: values as UpdateCandidatePayload,
              });
            } else if (candidateModal.data?.jobId) {
              await createCandidateMutation.mutateAsync({
                jobId: candidateModal.data.jobId,
                payload: values as CandidatePayload,
              });
            }
          }}
        />
      </Modal>

      <Modal open={jobDetailModal.isOpen} onOpenChange={closeJobDetailModal} title="Job Details">
        {jobDetailsQuery.isLoading ? (
          <LoadingState title="Loading job" />
        ) : jobDetailsQuery.data ? (
          <JobDetails
            job={jobDetailsQuery.data}
            onNewCandidate={() => openNewCandidate(jobDetailsQuery.data!.id)}
            columns={candidateTableColumns}
          />
        ) : (
          <EmptyState title="No job selected" description="Select a job to view candidate details." />
        )}
      </Modal>
    </div>
  );
};

const JobDetails = ({
  job,
  onNewCandidate,
  columns,
}: {
  job: JobWithCandidates;
  onNewCandidate: () => void;
  columns: DataTableColumn<CandidateApplicationRecord>[];
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{job.title}</h3>
        <p className="text-sm text-muted-foreground">{job.department}</p>
        <p className="text-sm mt-2 whitespace-pre-wrap">{job.description ?? 'No description'}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          <StageBadge stage={job.status} />
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
            <span className="font-medium">Openings:</span> {job.openings}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
            <span className="font-medium">Total candidates:</span> {job.totalCandidates}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Candidates</h4>
        <Button size="sm" onClick={onNewCandidate}>
          Add Candidate
        </Button>
      </div>

      {job.candidates.length === 0 ? (
        <EmptyState
          title="No candidates yet"
          description="Share the job posting or add candidates manually."
          actionLabel="Add Candidate"
          onAction={onNewCandidate}
        />
      ) : (
        <DataTable
          data={job.candidates}
          getRowId={(row: CandidateApplicationRecord) => row.id}
          columns={columns}
        />
      )}
    </div>
  );
};
