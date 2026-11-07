import { logoutAction } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button className="button button-quiet" type="submit">Sign out</button>
    </form>
  );
}
