import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import * as SecureStore from 'expo-secure-store';

const poolData = {
  UserPoolId: process.env.EXPO_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
  ClientId: process.env.EXPO_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
};

const userPool = new CognitoUserPool(poolData);

export const authService = {
signUp(
  username: string,
  email: string,
  password: string,
  name: string,
  role: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'name', Value: name }),
      new CognitoUserAttribute({ Name: 'custom:role', Value: role }),
    ];

    userPool.signUp(username, password, attributeList, [], (err, result) => {
      if (err) {
        reject(new Error(err.message));
        return;
      }
      resolve(true);
    });
  });
},

  confirmSignUp(email: string, code: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(new Error(err.message));
          return;
        }
        resolve(true);
      });
    });
  },

  signIn(email: string, password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      const authDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      cognitoUser.authenticateUser(authDetails, {
        onSuccess: async (result) => {
          const idToken = result.getIdToken().getJwtToken();
          await SecureStore.setItemAsync('authToken', idToken);
          resolve(idToken);
        },
        onFailure: (err) => {
          reject(new Error(err.message));
        },
      });
    });
  },

  async logout(): Promise<void> {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    await SecureStore.deleteItemAsync('authToken');
  },

  getCurrentSession(): Promise<string | null> {
    return new Promise((resolve) => {
      const cognitoUser = userPool.getCurrentUser();
      if (!cognitoUser) {
        resolve(null);
        return;
      }

      cognitoUser.getSession((err: any, session: any) => {
        if (err || !session?.isValid()) {
          resolve(null);
          return;
        }
        resolve(session.getIdToken().getJwtToken());
      });
    });
  },

  getCurrentUser(): CognitoUser | null {
    return userPool.getCurrentUser();
  },
};
