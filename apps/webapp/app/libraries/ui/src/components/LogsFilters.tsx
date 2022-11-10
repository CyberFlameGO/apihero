import { Form, useSearchParams, useSubmit } from "@remix-run/react";
import type { GetLogsSuccessResponse } from "internal-logs";
import React, { useEffect, useRef, useState } from "react";
import { ComboBox } from "./ComboBox";
import { Input } from "./Primitives/Input";
import { statusCodes } from "./StatusCode";

export function LogsFilters({ logs }: { logs: GetLogsSuccessResponse }) {
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const [searchParams] = useSearchParams();
  const searchObject = Object.fromEntries(searchParams.entries());

  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    console.log("handleChange");
    submit(event.currentTarget, { replace: true });
  }

  return (
    <Form
      method="get"
      className="py-4 flex gap-2"
      onChange={handleChange}
      ref={formRef}
    >
      {searchObject.page && (
        <input type="hidden" name="page" value={searchObject.page} />
      )}
      <FilterTextField
        name="api"
        label="API"
        defaultValue={searchObject.api ?? undefined}
      />
      <FilterTextField
        name="path"
        label="Path"
        defaultValue={searchObject.path ?? undefined}
      />
      <StatusComboBox
        defaultValue={searchObject.status ?? ""}
        formRef={formRef}
      />

      <button type="submit" className="btn btn-primary">
        Filter
      </button>
    </Form>
  );
}

function FormField({
  label,
  name,
  children,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sm:col-span-2">
      <Label label={label} htmlFor={name} />
      <div className="mt-1">{children}</div>
    </div>
  );
}

function FilterTextField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string | undefined;
}) {
  return (
    <FormField label={label} name={name}>
      <Input type="text" name={name} defaultValue={defaultValue} />
    </FormField>
  );
}

function Label({ label, htmlFor }: { label: string; htmlFor: string }) {
  return (
    <label
      className="block text-sm font-medium text-gray-700"
      htmlFor={htmlFor}
    >
      {label}
    </label>
  );
}

function StatusComboBox({
  defaultValue,
  formRef,
}: {
  defaultValue: string;
  formRef: React.RefObject<HTMLFormElement>;
}) {
  const submit = useSubmit();
  const selected =
    defaultValue === "" ? [] : defaultValue.split(",").map((v) => v.trim());
  const [values, setValues] = useState(
    selected.length > 0 ? selected : everythingCodes
  );

  useEffect(() => {
    console.log("submit");
    if (formRef.current) {
      submit(formRef.current, { replace: true });
    }
  }, [values, formRef, submit]);

  return (
    <FormField label="Status" name="status">
      <>
        {values.length > 0 && (
          <input type="hidden" name="status" value={values.join(",")} />
        )}
        <ComboBox
          multiple
          options={statusCodeOptions}
          initialValue={values}
          onChange={(changed) => {
            if (changed.some((v) => v === "all") || changed.length === 0) {
              setValues(everythingCodes);
            } else {
              setValues(changed);
            }
          }}
        />
      </>
    </FormField>
  );
}

const everythingCodes = ["2**", "3**", "4**", "5**"];

const statusCodeOptions = [
  { label: "All", value: "all" },
  { label: "Success", value: "2**" },
  { label: "Redirect", value: "3**" },
  { label: "Client Error", value: "4**" },
  { label: "Server Error", value: "5**" },
  ...statusCodes.map((code) => ({
    label: `${code}`,
    value: `${code}`,
  })),
];
