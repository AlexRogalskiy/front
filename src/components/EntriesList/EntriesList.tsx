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
  const [enabledFeatures, setEnabledFeatures] = React.useState([]);

  const handleCloseLicenseRequiredDialog = () => {
    setOpenLicenseRequiredDialog(false);
  };

  useInterval(async () => {
    fetch(`${HubBaseUrl}/pcaps/total-size`)
      .then(response => response.ok ? response : response.json().then(err => Promise.reject(err)))
      .then(response => response.json())
      .then(data => setTotalSize(data.total))
      .catch(err => {
        console.error(err);
        if (err.EnabledFeatures.length > 0) {
          setOpenLicenseRequiredDialog(true);
          setEnabledFeatures(err.EnabledFeatures);
        }
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
        <DialogTitle>{"PRO Version Required!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <b>{enabledFeatures.join(", ")}</b>
            {(enabledFeatures.length > 1 ? " are" : " is") + " only available in the PRO version. Upgrade now by using:"}
            <SyntaxHighlighter
              showLineNumbers={false}
              code={`kubeshark pro`}
              language="bash"
            />
            {"or read more about it "}
            <Link href="https://kubeshark.co/pricing" underline="hover" target="_blank">here</Link>
            {"."}
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
    </div>
  </React.Fragment>;
};
