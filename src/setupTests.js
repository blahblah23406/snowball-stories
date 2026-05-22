// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Clean mock of the centralized firebase.js gateway
// Uses regular JS functions to survive Jest's "resetMocks" configuration
jest.mock('./firebase', () => {
  return {
    auth: {
      currentUser: null,
    },
    googleProvider: {},
    db: {},
    signInWithRedirect: () => Promise.resolve(),
    onAuthStateChanged: (auth, callback) => {
      // Synchronously trigger callback to support instant rendering
      callback(null);
      // Return a valid unsubscribe function
      return () => {};
    },
    collection: () => ({}),
    query: () => ({}),
    where: () => ({}),
    getDocs: () => Promise.resolve({ docs: [] }),
    updateDoc: () => Promise.resolve(),
    doc: () => ({}),
    setDoc: () => Promise.resolve(),
    getDoc: () => Promise.resolve({ exists: () => false, data: () => ({}) }),
    deleteDoc: () => Promise.resolve(),
  };
});
