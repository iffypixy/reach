import { createRoot } from "react-dom/client";

import { App } from "~/app";
import { SessionProvider } from "~/lib/session";
import "~/globals.css";

const root = document.getElementById("root")!;

createRoot(root).render(
	<SessionProvider>
		<App />
	</SessionProvider>,
);
