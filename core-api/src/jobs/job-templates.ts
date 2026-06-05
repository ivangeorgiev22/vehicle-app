export const mission_templates = {
  'Cleaning': [
    {
      job_title: 'Exterior Clean',
      tasks: [
        {
          key: 'clean-1',
          description: 'Wash the vehicle',
          task_status: 'Waiting'
        },
        {
          key: 'clean-2',
          description: 'Dry the vehicle',
          task_status: 'Waiting'
        },
        {
          key: 'clean-3',
          description: 'Machine polish the vehicle',
          task_status: 'Waiting'
        }
      ]
    }
  ],
  'Fly Doctor': [
    {
      job_title: 'Bring vehicle to warehouse',
      tasks: [
        {
          key: 'doctor-1',
          description: 'Pick up the vehicle and bring it to the main warehouse',
          task_status: 'Waiting'
        }
      ]
    }
  ],
  'Maintenance': [
    {
      job_title: 'Vehicle inspection',
      tasks: [
        {
          key: 'inspect-1',
          description: 'Inspect exterior and interior of vehicle',
          task_status: 'Waiting'
        }
      ]
    }
  ]
}