import Policy from "@/components/policies/Policy";
import React from "react";

function page() {
  return (
    <>
      <Policy
        policyType="shipping"
        initialContent="<p>This shipping policy covers delivery times, shipping costs, and delivery options...</p>"
      />
    </>
  );
}

export default page;
