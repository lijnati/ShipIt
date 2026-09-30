import { NotFoundView } from "@/components/shipit/not-found-view";

export default function ProfileNotFound() {
  return (
    <NotFoundView
      title="Nobody ships under that name."
      body="No ShipIt profile here. The username might be free — claim it before someone else does."
    />
  );
}
