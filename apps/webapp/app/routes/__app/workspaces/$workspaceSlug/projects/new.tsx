import { BookmarkIcon } from "@heroicons/react/24/outline";
import type { ActionFunction, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import * as React from "react";
import {
  PrimaryButton,
  PrimaryLink,
  SecondaryLink,
} from "~/libraries/ui/src/components/Buttons/Buttons";
import {
  createWorkspace,
  getWorkspaceFromSlug,
} from "~/models/workspace.server";
import { requireUserId } from "~/services/session.server";
import invariant from "tiny-invariant";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { createProject } from "~/models/project.server";

type ActionData = {
  errors?: {
    title?: string;
    body?: string;
  };
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const { workspaceSlug } = params;
  invariant(workspaceSlug, "workspaceSlug not found");
  const workspace = await getWorkspaceFromSlug({ slug: workspaceSlug, userId });
  if (workspace === null) {
    throw new Response("Not Found", {
      status: 404,
    });
  }
  return typedjson(workspace);
};

export const action: ActionFunction = async ({ request, params }) => {
  const { workspaceSlug } = params;
  invariant(workspaceSlug, "workspaceSlug not found");
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");

  if (typeof title !== "string" || title.length === 0) {
    return json<ActionData>(
      { errors: { title: "Title is required" } },
      { status: 400 }
    );
  }

  const workspace = await getWorkspaceFromSlug({ slug: workspaceSlug, userId });
  if (workspace === null) {
    throw new Response("Not Found", {
      status: 404,
    });
  }

  const project = await createProject({ title, workspaceId: workspace.id });
  return redirect(`/workspaces/${workspace.slug}/projects/${project.slug}`);
};

export default function NewProjectPage() {
  const data = useTypedLoaderData<typeof loader>();
  const actionData = useActionData() as ActionData;
  const titleRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.title) {
      titleRef.current?.focus();
    }
  }, [actionData]);

  return (
    <main className="bg-slate-50 w-full h-screen flex items-center justify-center">
      <div className="flex flex-col gap-y-3.5 min-w-[500px] bg-white shadow border border-slate-200 rounded-md p-10">
        <h3 className="font-semibold text-slate-600 text-xl">
          Create a new Project
        </h3>
        <p className="text-slate-600">
          Create a new Project inside your <i>{data.title}</i> Workspace.
        </p>
        <Form
          method="post"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
          }}
        >
          <div className="flex w-full flex-col gap-1 mb-2.5">
            <label className="text-slate-500 text-sm">Name your Project</label>
            <div className="group flex">
              <div className="flex justify-end pointer-events-none z-10 -mr-8 items-center w-8">
                <BookmarkIcon className="h-5 w-5 text-slate-600"></BookmarkIcon>
              </div>
              <input
                ref={titleRef}
                name="title"
                placeholder="e.g. My first Project"
                className="relative w-full pl-10 pr-3 py-2 rounded-md border text-slate-600 bg-slate-50 group-focus:border-blue-500 placeholder:text-slate-400"
                aria-invalid={actionData?.errors?.title ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.title ? "title-error" : undefined
                }
              />
            </div>
          </div>
          {actionData?.errors?.title && (
            <div className="pt-1 text-red-700" id="title-error">
              {actionData.errors.title}
            </div>
          )}

          <div className="flex justify-between">
            <SecondaryLink
              to="/"
              className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Cancel
            </SecondaryLink>
            <PrimaryButton
              type="submit"
              className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            >
              Create
            </PrimaryButton>
          </div>
        </Form>
      </div>
    </main>
  );
}
