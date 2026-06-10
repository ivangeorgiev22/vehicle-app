export const endpoints = [
  //entryApi
  {path: '/auth/login', method: 'POST', integration: 'entry'},
  {path: '/missions', method: 'POST', integration: 'entry'},
  {path: '/missions/{id}', method: 'GET', integration: 'entry'},
  {path: '/missions/{id}/status', method: 'PATCH', integration: 'entry'},
  {path: '/jobs', method: 'GET', integration: 'entry'},
  {path: '/jobs/{id}', method: 'GET', integration: 'entry'},
  {path: '/jobs/{id}/status', method: 'PATCH', integration: 'entry'},
  {path: '/jobs/{id}/task/{key}/status', method: 'PATCH', integration: 'entry'},
  {path: '/users/{id}/image', method: 'POST', integration: 'entry'},
  {path: '/users/{id}/image', method: 'GET', integration: 'entry'},

  //coreApi
  {path: '/api/users', method: 'POST', integration: 'core'},
  {path: '/api/users/validate', method: 'POST', integration: 'core'},
  {path: '/api/missions', method: 'POST', integration: 'core'},
  {path: '/api/missions/{id}', method: 'GET', integration: 'core'},
  {path: '/api/missions/{id}/status', method: 'PATCH', integration: 'core'},
  {path: '/api/jobs', method: 'GET', integration: 'core'},
  {path: '/api/jobs/{id}', method: 'GET', integration: 'core'},
  {path: '/api/jobs/{id}/status', method: 'PATCH', integration: 'core'},
  {path: '/api/jobs/{id}/task/{key}/status', method: 'PATCH', integration: 'core'},
  {path: '/api/users/{id}/image', method: 'POST', integration: 'core'},
  {path: '/api/users/{id}/image', method: 'GET', integration: 'core'}
];