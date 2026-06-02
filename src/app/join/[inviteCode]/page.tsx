import { JoinChallenge } from "@/components/JoinChallenge";

type JoinPageProps = {
  params: Promise<{
    inviteCode: string;
  }>;
};

export default async function JoinPage({ params }: JoinPageProps) {
  const { inviteCode } = await params;

  return <JoinChallenge inviteCode={inviteCode} />;
}
