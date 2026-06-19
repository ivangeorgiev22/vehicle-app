import { type ApiEndpoint } from './core-endpoints';

export const entryApiEndpoints: ApiEndpoint[] = [
    {
        endpointUrl: 'auth',
        subEndpoints: [
            {
                endpointUrl: 'login',
                httpMethods: ['POST']
            }
        ]
    },
    {
        endpointUrl: 'missions',
        httpMethods: ['POST'],
        subEndpoints: [
            {
                endpointUrl: '{id}',
                httpMethods: ['GET'],
                subEndpoints: [
                    {
                        endpointUrl: 'status',
                        httpMethods: ['PATCH']
                    }
                ]
            }
        ]
    },
    {
        endpointUrl: 'jobs',
        httpMethods: ['GET'],
        subEndpoints: [
            {
                endpointUrl: '{id}',
                httpMethods: ['GET'],
                subEndpoints: [
                    {
                        endpointUrl: 'status',
                        httpMethods: ['PATCH']
                    },
                    {
                        endpointUrl: 'task',
                        subEndpoints: [
                            {
                                endpointUrl: '{key}',
                                subEndpoints: [
                                    {
                                        endpointUrl: 'status',
                                        httpMethods: ['PATCH']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        endpointUrl: 'users',
        subEndpoints: [
            {
                endpointUrl: '{id}',
                subEndpoints: [
                    {
                        endpointUrl: 'image',
                        httpMethods: ['POST', 'GET']
                    }
                ]
            }
        ]
    }
];
