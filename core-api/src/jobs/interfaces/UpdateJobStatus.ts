export interface UpdateJobStatus {
  job_status: 'Backlog' | 'Accepted' | 'In progress' | 'Completed' | 'Cancelled'
}