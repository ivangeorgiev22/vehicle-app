export const missionTemplates = {
  'Cleaning': [
    {
      jobTitle: 'Exterior Clean',
      tasks: [
        {
          key: 'clean-1',
          description: 'Wash the vehicle',
          taskStatus: 'Waiting'
        },
        {
          key: 'clean-2',
          description: 'Dry the vehicle',
          taskStatus: 'Waiting'
        },
        {
          key: 'clean-3',
          description: 'Machine polish the vehicle',
          taskStatus: 'Waiting'
        }
      ]
    }
  ],
  'Fly Doctor': [
    {
      jobTitle: 'Bring vehicle to warehouse',
      tasks: [
        {
          key: 'doctor-1',
          description: 'Pick up the vehicle and bring it to the main warehouse',
          taskStatus: 'Waiting'
        }
      ]
    }
  ],
  'Maintenance': [
    {
      jobTitle: 'Vehicle inspection',
      tasks: [
        {
          key: 'inspect-1',
          description: 'Inspect exterior and interior of vehicle',
          taskStatus: 'Waiting'
        }
      ]
    }
  ]
}