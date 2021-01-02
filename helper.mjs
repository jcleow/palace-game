import jsSHA from 'jssha';

// Function that converts supplied userId into a hash (using a salt)
export default function convertUserIdToHash(userId) {
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  // const unhashedCookieString = `${userId}-${SALT}`;
  shaObj.update(userId);
  const hashedCookieString = shaObj.getHash('HEX');
  return hashedCookieString;
}

// Function that hashes a variable
export const hashPassword = (reqBodyPassword) => {
  // Perform hashing of password first
  const shaObj = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
  shaObj.update(reqBodyPassword);
  const hash = shaObj.getHash('HEX');
  return hash;
};
