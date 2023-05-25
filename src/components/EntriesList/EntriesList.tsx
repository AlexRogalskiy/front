import React, { useState, useMemo } from "react";
import styles from './EntriesList.module.sass';
import ScrollableFeedVirtualized from "react-scrollable-feed-virtualized";
import down from "./assets/downImg.svg";
import Moment from "moment";
import { useInterval } from "../../helpers/interval";
import { EntryItem } from "../EntryListItem/EntryListItem";
import { HubBaseUrl } from "../../consts";
import { Entry } from "../EntryListItem/Entry";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import {
  Link,
} from "@mui/material";
import { SyntaxHighlighter } from "../UI/SyntaxHighlighter";
import { Descope, getSessionToken, getRefreshToken, useUser, useDescope } from '@descope/react-sdk';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown, string>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface EntriesListProps {
  entries: Entry[];
  listEntryREF: React.LegacyRef<HTMLDivElement>;
  onSnapBrokenEvent: () => void;
  isSnappedToBottom: boolean;
  setIsSnappedToBottom: (state: boolean) => void;
  scrollableRef: React.MutableRefObject<ScrollableFeedVirtualized>;
}

export const EntriesList: React.FC<EntriesListProps> = ({
  entries,
  listEntryREF,
  onSnapBrokenEvent,
  isSnappedToBottom,
  setIsSnappedToBottom,
  scrollableRef,
}) => {
  const [totalSize, setTotalSize] = useState("0B");

  const [timeNow, setTimeNow] = useState(new Date());

  const [openLicenseRequiredDialog, setOpenLicenseRequiredDialog] = React.useState(false);
  const [openLogin, setOpenLogin] = React.useState(false);
  const [openedLoginOnce, setOpenedLoginOnce] = React.useState(false);
  const [openUnauthorizedDialog, setOpenUnauthorizedDialog] = React.useState(false);

  const { user } = useUser();
  const descopeSdk = useDescope();

  const handleCloseLicenseRequiredDialog = () => {
    setOpenLicenseRequiredDialog(false);
  };

  const handleCloseLogin = () => {
    setOpenLogin(false);
  };

  const handleCloseUnauthorizedDialog = async () => {
    setOpenUnauthorizedDialog(false);
    await descopeSdk.logout();
    window.location.reload();
  };

  useInterval(async () => {
    let status: number;
    fetch(`${HubBaseUrl}/pcaps/total-size?refresh-token=${encodeURIComponent(getRefreshToken())}`, {
      headers: {
        Authorization: getSessionToken(),
      },
    })
      .then(response => {
        status = response.status;
        return response.json();
      })
      .then(data => {
        switch (status) {
        case 418:
          setOpenLogin(false);
          if (data.EnabledFeatures.length > 0) {
            setOpenLicenseRequiredDialog(true);
          }
          break;
        case 403:
          setOpenLogin(true);
          setOpenedLoginOnce(true);
          break;
        case 401:
          if (openedLoginOnce)
            setOpenUnauthorizedDialog(true);
          else
            setOpenLogin(true);
          break;
        default:
          setOpenLogin(false);
          setTotalSize(data.total);
          break;
        }
      })
      .catch(err => {
        console.error(err);
      });
  }, 3000, true);

  useInterval(async () => {
    setTimeNow(new Date());
  }, 1000, true);

  const memoizedEntries = useMemo(() => {
    return entries;
  }, [entries]);

  return <React.Fragment>
    <div className={styles.list}>
      <div id="list" ref={listEntryREF} className={styles.list}>
        <ScrollableFeedVirtualized ref={scrollableRef} itemHeight={48} marginTop={10} onSnapBroken={onSnapBrokenEvent}>
          {false /* It's because the first child is ignored by ScrollableFeedVirtualized */}
          {memoizedEntries.map(entry => {
            return <EntryItem
              key={entry.key}
              entry={entry}
              style={{}}
              headingMode={false}
            />
          })}
        </ScrollableFeedVirtualized>
        <button type="button"
          title="Snap to bottom"
          className={`${styles.btnLive} ${isSnappedToBottom ? styles.hideButton : styles.showButton}`}
          onClick={() => {
            scrollableRef.current.jumpToBottom();
            setIsSnappedToBottom(true);
          }}>
          <img alt="down" src={down} />
        </button>
      </div>

      <div className={styles.footer}>
        <div>Showing <b id="item-count">{entries.length}</b> items from a total of <b
          id="total-tcp-streams">{totalSize}</b> traffic capture
        </div>
        <div>
          UTC:
          <span style={{
            marginLeft: 5,
            marginRight: 5,
            fontWeight: 600
          }}>
            {Moment(timeNow).utc().format('MM/DD/YYYY, h:mm:ss.SSS A')}
          </span>
        </div>
      </div>
    </div>
    <div>
      <Dialog
        open={openLicenseRequiredDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseLicenseRequiredDialog}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Oops something went wrong!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {"Please try to install latest CLI version if you're a CLI user:"}
            <SyntaxHighlighter
              showLineNumbers={false}
              code={`sh <(curl -Ls https://kubeshark.co/install)`}
              language="bash"
            />
            {" If the issue persists then please refer to "}
            <Link href="https://docs.kubeshark.co/en/troubleshooting" underline="hover" target="_blank">troubleshooting</Link>
            {" page."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleCloseLicenseRequiredDialog}
            style={{ margin: 10 }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openLogin}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseLogin}
        aria-describedby="alert-dialog-slide-description"
      >
        <Descope
          flowId="sign-up-or-in"
          theme="light"
          onSuccess={() => {
            setOpenLogin(false);
          }}
          onError={(err: unknown) => {
            console.error(err)
          }}
        />
      </Dialog>

      <Dialog
        open={openUnauthorizedDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseUnauthorizedDialog}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Unauthorized Access!</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            Your email <b>{user?.email}</b> is unauthorized for this cluster.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleCloseUnauthorizedDialog}
            style={{ margin: 10 }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  </React.Fragment>;
};
