import Policy from "@/components/policies/Policy";
import React from "react";

function page() {
  return (
    <>
      <Policy
        policyType="terms"
        initialContent="<p>Welcome to our Terms and Conditions. By using our service, you agree to the following terms...</p>"
      />
    </>
  );
}

export default page;
