import { FacebookIcon } from "../icons/facebook-icon";
import { Button } from "../ui/button";

export function FacebookButton() {
  return (
    <Button variant="outline">
      <FacebookIcon className="mr-2 h-4 w-4" />
      Sign in with Facebook
    </Button>
  );
}
