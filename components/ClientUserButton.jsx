"use client";

import { UserButton } from "@clerk/nextjs";
import React from "react";

export default function ClientUserButton(props) {
  return <UserButton {...props} />;
}
