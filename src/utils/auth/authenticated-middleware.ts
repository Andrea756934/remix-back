import passport, { session } from "passport";

export const isAuthenticated = passport.authenticate('jwt', { session: false });