function PrivacyPolicyPage() {
  return (
    <main className="flex w-full justify-center mt-20">
    <div className="flex flex-col gap-6 m-16">
      <h3 className="font-semibold text-3xl text-gray-700 text-center mb-4">Privacy Policy</h3>
      <p><strong>Last Updated:</strong> {new Date().getFullYear()}</p>
      <p>Welcome to <strong>Carrot Cake</strong> ("Website," "Service," "we," "us," or "our"). Your privacy is important to us, and this Privacy Policy outlines how we handle user information when you use our Service.</p>

      <h2>1. Information We Collect</h2>
      <p>- The only user information we store is your email address, which is securely stored in Firebase DB.</p>
      <p>- We do not collect, store, or retain any other user data.</p>

      <h2>2. How We Use Your Information</h2>
      <p>- Your email address is used solely for authentication and account management purposes.</p>
      <p>- We do not use your email for marketing, advertising, or any other purpose beyond authentication.</p>

      <h2>3. Third-Party Authentication (OAuth)</h2>
      <p>- Our Service utilizes Google OAuth for authentication and YouTube integration.</p>
      <p>- We do not have direct access to your YouTube data or any other personal information associated with your Google account.</p>
      <p>- All interactions with YouTube and Google services are handled securely through OAuth.</p>

      <h2>4. Data Sharing and Security</h2>
      <p>- We do not share, sell, or distribute user information to any third parties.</p>
      <p>- All connections and data transmissions are encrypted and securely managed.</p>
      <p>- We take reasonable measures to protect your information from unauthorized access or misuse.</p>

      <h2>5. User Control and Revocation</h2>
      <p>- You can disconnect your YouTube account at any time through your Google account settings.</p>
      <p>- If you wish to delete your account and remove your stored email address, please contact us at <strong>collyerdesign@gmail.com</strong>.</p>

      <h2>6. Changes to This Privacy Policy</h2>
      <p>- We reserve the right to update this Privacy Policy as needed.</p>
      <p>- Continued use of our Service after changes constitute acceptance of the revised policy.</p>

      <h2>7. Contact Information</h2>
      <p>If you have any questions or concerns regarding this Privacy Policy, please contact us at <strong>collyerdesign@gmail.com</strong>.</p>

      <p>By using <strong>Carrot Cake</strong>, you acknowledge that you have read, understood, and agreed to this Privacy Policy.</p>
    </div>
  </main>
  )
}

export default PrivacyPolicyPage;