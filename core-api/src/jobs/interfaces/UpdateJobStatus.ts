export interface UpdateJobStatus {
  jobStatus: 'Backlog' | 'Accepted' | 'In progress' | 'Completed' | 'Cancelled'
}