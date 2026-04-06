import React from "react";
import AuthView from "../AuthView";

type RegisterPageProps = {
  onRegisterSubmit: (data: {
    firstName: string;
    lastName: string;
    nationalId: string;
    phone: string;
    email: string;
    password: string;
    address: string;
  }) => void | Promise<void>;
  onGoToLogin: () => void;
};

export default function RegisterPage({
  onRegisterSubmit,
  onGoToLogin,
}: RegisterPageProps) {
  return (
    <AuthView
      isRegister={true}
      onToggle={onGoToLogin}
      onLoginSubmit={async () => {}}
      onRegisterSubmit={onRegisterSubmit}
    />
  );
}