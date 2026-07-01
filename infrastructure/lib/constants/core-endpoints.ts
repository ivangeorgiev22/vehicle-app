export interface ApiEndpoint {
    endpointUrl: string;
    httpMethods?: string[];
    subEndpoints?: ApiEndpoint[];
}

export const apiEndpoints: ApiEndpoint[] = [
    {
        endpointUrl: 'users',
        httpMethods: ['POST'],
        subEndpoints: [
            {
                endpointUrl: 'validate',
                httpMethods: ['POST'],
            },
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
        endpointUrl: 'vehicles',
        httpMethods: ['GET', 'POST'],
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
    }
];
