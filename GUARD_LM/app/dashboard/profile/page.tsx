import { ProfileForm } from "@/components/profile/ProfileForm";
import { requireUser } from "@/lib/auth/session";

export default async function ProfilePage() {
  const user = await requireUser();

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm font-black uppercase text-mint">Profile</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Account settings</h1>
        <p className="mt-3 max-w-2xl text-cloud/60">
          Manage client details, company information, and password changes.
        </p>
      </section>

      <ProfileForm
        user={{
          name: user.name,
          companyName: user.companyName,
          email: user.email,
          role: user.role
        }}
      />
    </div>
  );
}
