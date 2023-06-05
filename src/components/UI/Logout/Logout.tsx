import React from "react";
import Button from '@mui/material/Button';
import { useDescope, useSession } from '@descope/react-sdk';
import styles from "./Logout.module.sass"

export const Logout: React.FC = () => {
  const descopeSdk = useDescope();
  const { isAuthenticated } = useSession();

  const onClickLogout = async () => {
    await descopeSdk.logout();
    window.location.reload();
  };

  return <>
    {!isAuthenticated
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
