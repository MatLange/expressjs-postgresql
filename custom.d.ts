// custom.d.ts
// Create a Custom Type Definition: Create a file named custom.d.ts (or any name you prefer) in your project to extend the Request interface.
// Because the Request interface does not contain the user property by default, you can extend the Request interface to include the user property.
import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: any; // You can replace `any` with a more specific type if you know the structure of `user`
  }
}