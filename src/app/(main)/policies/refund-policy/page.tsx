import Policy from "@/components/policies/Policy";
import React from "react";

function page() {
  return (
    <>
      <Policy
        policyType="refund"
        initialContent="<p>Our refund policy outlines the conditions under which refunds are available...</p>"
      />
    </>
  );
}

export default page;
