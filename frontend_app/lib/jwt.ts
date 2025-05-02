import jwt from 'jsonwebtoken';

export const verifyJWT = (token:string) => {
  try {
    return jwt.verify(token, process.env.SECRET_KEY!);
  } catch (error) {
    throw new Error(`Invalid or expired token: ${error}`);
  }
};

export const updateLocalToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

