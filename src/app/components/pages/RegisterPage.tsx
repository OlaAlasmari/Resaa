import React from "react";
import AuthView from "../AuthView";

type RegisterPageProps = {
  onLogin: () => void;
  onGoToLogin: () => void;
};

export default function RegisterPage({
  onLogin,
  onGoToLogin,
}: RegisterPageProps) {
  return (
    <AuthView
      isRegister={true}
      onToggle={onGoToLogin}
      onLogin={onLogin}
    />
  );
}