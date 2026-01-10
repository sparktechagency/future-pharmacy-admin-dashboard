import Policy from "@/components/policies/Policy";
import React from "react";

function page() {
  return (
    <>
      <Policy
        policyType="cookies"
        initialContent="<p>This Cookie Policy explains how we use cookies and similar technologies on our website...</p>"
      />
    </>
  );
}

export default page;
