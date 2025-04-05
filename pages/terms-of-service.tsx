function TermsOfServicePage() {
  return (
    <main className="flex w-full justify-center mt-20">
      <div className="flex flex-col gap-6 m-16">
        <h3 className="font-semibold text-3xl text-gray-700 text-center mb-4">Terms of Service</h3>
        <p><strong>Last Updated:</strong> {new Date().getFullYear()}</p>

        <p>Welcome to <strong>Carrot Cake</strong> ("Website," "Service," "we," "us," or "our"). By accessing or using our Website, you agree to comply with and be bound by the following Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.</p>

        <h2>1. Description of Service</h2>
        <p><strong>Carrot Cake</strong> allows users to create an account, log in and log out, and connect to their YouTube account via Google OAuth authentication. Once connected, users can upload videos to their YouTube channel directly.</p>

        <h2>2. User Accounts</h2>
        <p>To use our Service, you must create an account using Firebase authentication.</p>
        <p>The only user information stored in our system is your username. No other data is retained.</p>
        <p>You are responsible for maintaining the confidentiality of your login credentials.</p>
        <p>You must notify us immediately of any unauthorized use of your account.</p>

        <h2>3. Connection to YouTube via OAuth</h2>
        <p>Our Website allows users to connect to their YouTube account securely via Google OAuth.</p>
        <p>By connecting your YouTube account, you grant our Website permission to upload videos on your behalf.</p>
        <p>We do not store, access, or retain any personal data from your YouTube account beyond the necessary authentication process.</p>
        <p>You may revoke access at any time through your Google account settings.</p>

        <h2>4. Data and Privacy</h2>
        <p>We do not collect, store, or retain any user data except for the username, which is stored in Firebase DB.</p>
        <p>All authentication and data transfer are securely handled through Google OAuth and Firebase.</p>
        <p>For more details, please refer to our <a href="/privacy-policy" className="underline">Privacy Policy</a>.</p>

        <h2>5. User Responsibilities</h2>
        <p>You agree to use the Service in compliance with all applicable laws, regulations, and YouTube policies.</p>
        <p>You shall not use the Service for any unlawful, infringing, or malicious purposes.</p>
        <p>You are solely responsible for the content you upload to YouTube through our Service.</p>

        <h2>6. Service Availability</h2>
        <p>We do not guarantee uninterrupted or error-free access to the Service.</p>
        <p>We reserve the right to modify, suspend, or discontinue the Service at any time without notice.</p>

        <h2>7. Limitation of Liability</h2>
        <p>We are not responsible for any issues, damages, or losses resulting from the use of our Service.</p>
        <p>We do not assume liability for any content uploaded to YouTube through our Website.</p>
        <p>Your use of the Service is at your own risk.</p>

        <h2>8. Changes to the Terms</h2>
        <p>We reserve the right to update or modify these Terms at any time.</p>
        <p>Continued use of the Service after modifications constitute acceptance of the new Terms.</p>

        <h2>9. Termination</h2>
        <p>We may suspend or terminate your access to the Service at our discretion if you violate these Terms.</p>
        <p>You may discontinue use of the Service at any time by disconnecting your YouTube account.</p>

        <h2>10. Contact Information</h2>
        <p>If you have any questions or concerns regarding these Terms, please contact us at <a href="mailto:collyerdesign@gmail.com">collyerdesign@gmail.com</a>.</p>

        <p>By using <strong>Carrot Cake</strong>, you acknowledge that you have read, understood, and agreed to these Terms of Service.</p>
      </div>
    </main>
  )
}

export default TermsOfServicePage;