import * as bcrypt from 'bcrypt';

const adminPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin', 10);
const operatorPassowrd = bcrypt.hashSync(process.env.OPERATOR_PASSWORD || 'operator', 10);

export const users = [
  {
    PutRequest: {
      Item: {
        id: {S: process.env.ADMIN_ID || 'admin-001'},
        username: {S: process.env.ADMIN_USERNAME || 'admin'},
        password: {S: adminPassword},
        firstName: {S: process.env.ADMIN_FIRST_NAME || 'Admin'},
        lastName: {S: process.env.ADMIN_LAST_NAME || 'Admin'},
        email: {S: process.env.ADMIN_EMAIL || 'admin@test.com'},
        role: {S: 'ADMIN'}
      }
    }
  },
  {
    PutRequest: {
      Item: {
        id: {S: process.env.OPERATOR_ID || 'operator-001'},
        username: {S: process.env.OPERATOR_USERNAME || 'operator'},
        password: {S: operatorPassowrd},
        firstName: {S: process.env.OPERATOR_FIRST_NAME || 'Operator'},
        lastName: {S: process.env.OPERATOR_LAST_NAME || 'Operator'},
        email: {S: process.env.OPERATOR_EMAIL || 'operator@test.com'},
        role: {S: 'OPERATOR'}
      }
    }
  }
]