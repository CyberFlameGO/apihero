import type { Session } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { redirect as typedRedirect } from "remix-typedjson";
import { createCookieSessionStorage } from "@remix-run/node";
import invariant from "tiny-invariant";

export type ToastMessage = { message: string; type: "success" | "error" };

const ONE_YEAR = 1000 * 60 * 60 * 24 * 365;

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const { commitSession, getSession } = createCookieSessionStorage({
  cookie: {
    name: "__message",
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
});

export function setSuccessMessage(session: Session, message: string) {
  session.flash("toastMessage", { message, type: "success" } as ToastMessage);
}

export function setErrorMessage(session: Session, message: string) {
  session.flash("toastMessage", { message, type: "error" } as ToastMessage);
}

export async function redirectWithSuccessMessage(
  path: string,
  request: Request,
  message: string
) {
  const session = await getSession(request.headers.get("cookie"));

  setSuccessMessage(session, message);

  return redirect(path, {
    headers: {
      "Set-Cookie": await commitSession(session, {
        expires: new Date(Date.now() + ONE_YEAR),
      }),
    },
  });
}

export async function typedRedirectWithSuccessMessage(
  path: string,
  request: Request,
  message: string
) {
  const session = await getSession(request.headers.get("cookie"));

  setSuccessMessage(session, message);

  return typedRedirect(path, {
    headers: {
      "Set-Cookie": await commitSession(session, {
        expires: new Date(Date.now() + ONE_YEAR),
      }),
    },
  });
}

export async function redirectWithErrorMessage(
  path: string,
  request: Request,
  message: string
) {
  const session = await getSession(request.headers.get("cookie"));

  setErrorMessage(session, message);

  return redirect(path, {
    headers: {
      "Set-Cookie": await commitSession(session, {
        expires: new Date(Date.now() + ONE_YEAR),
      }),
    },
  });
}
