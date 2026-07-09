import React, { useEffect, useRef } from "react";
import { googleLogin } from "../api/googleAuthApi.js";

const GOOGLE_CLIENT_ID = "78573598233-r130hni4se61pb6o9ndvnv47addikd8k.apps.googleusercontent.com";

export default function GoogleSignInButton({ onAuthed, onError }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    function renderButton() {
      if (!window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const data = await googleLogin(response.credential);
            onAuthed(data);
          } catch (err) {
            onError(err.message || "Google sign-in failed.");
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
    }

    if (window.google) {
      renderButton();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          renderButton();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [onAuthed, onError]);

  return <div ref={buttonRef} />;
}