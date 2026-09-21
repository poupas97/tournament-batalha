"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Title from "@/components/Title";
import Form from "@/components/Form";
import { ILoginFormValues } from "@/types/user";

export default function LoginPage() {
  const router = useRouter();

  async function handleSubmit(values: ILoginFormValues) {
    const response = await signIn("credentials", {
      redirect: false,
      ...values,
    });
    if (response && (response as any).ok) {
      router.push("/backoffice");
      router.refresh();
      return;
    }

    alert("Credenciais inválidas.");
  }

  return (
    <>
      <Title label="Login Backoffice" />

      <Form<ILoginFormValues>
        fields={[
          { key: "email", label: "Email", type: "email" },
          { key: "password", label: "Password", type: "password" },
        ]}
        vertical
        onSubmit={handleSubmit}
      />
    </>
  );
}
