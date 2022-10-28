import React from "react";
import { User } from "../util/prisma-types";

const FrameworkUserContext = React.createContext<User | null>(null);
export const FrameworkUserProvider = FrameworkUserContext.Provider;
export const useFrameworkUser = () =>
  React.useContext<User | null>(FrameworkUserContext);
