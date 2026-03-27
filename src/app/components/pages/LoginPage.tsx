import React from "react";
import AuthView from "../AuthView";

type LoginPageProps = {
  onLogin: () => void;
  onGoToRegister: () => void;
};

export default function LoginPage({
  onLogin,
  onGoToRegister,
}: LoginPageProps) {
  return (
    <AuthView
      isRegister={false}
      onToggle={onGoToRegister}
      onLogin={onLogin}
    />
  );
}