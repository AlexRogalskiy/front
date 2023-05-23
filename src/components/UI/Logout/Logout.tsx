import React from "react";
import Button from '@mui/material/Button';
import { useDescope, getSessionToken, getRefreshToken } from '@descope/react-sdk';
import styles from "./Logout.module.sass"

export const Logout: React.FC = () => {
  const descopeSdk = useDescope();

  const onClickLogout = async () => {
    await descopeSdk.logout();
    window.location.reload();
  };

  return <>
    {!getSessionToken() || !getRefreshToken()
      ? <></>
      : <Button
        variant="contained"
        onClick={onClickLogout}
        title="logout"
        className={`${styles.button}`}
      >
        Logout
      </Button>
    }
  </>
}
