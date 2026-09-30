import { NotFoundView } from "@/components/shipit/not-found-view";

export default function ChallengeNotFound() {
  return (
    <NotFoundView
      title="This promise doesn't exist."
      body="Maybe someone failed so hard they deleted the URL. (They can't, actually. Check the link.)"
    />
  );
}
