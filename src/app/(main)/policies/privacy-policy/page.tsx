import Policy from "@/components/policies/Policy";
import React from "react";

function page() {
  return (
    <>
      <Policy
        policyType="privacy"
        initialContent="<p>This Privacy Policy describes how we collect, use, and protect your personal information...</p>"
      />
    </>
  );
}

export default page;
