import React from "react";
import AuthView from "../AuthView";

type LoginPageProps = {
  onLoginSubmit: (data: { nationalId: string; password: string }) => void | Promise<void>;
  onGoToRegister: () => void;
};

export default function LoginPage({
  onLoginSubmit,
  onGoToRegister,
}: LoginPageProps) {
  return (
    <AuthView
      isRegister={false}
      onToggle={onGoToRegister}
      onLoginSubmit={onLoginSubmit}
      onRegisterSubmit={async () => {}}
    />
  );
}