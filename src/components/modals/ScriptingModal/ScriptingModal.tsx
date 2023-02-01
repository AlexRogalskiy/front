import React, { useEffect } from "react";
import { Box, Fade, Modal, Backdrop, Tabs, Tab, Typography, Button } from "@mui/material";
import closeIcon from "./assets/close.svg"
import styles from './ScriptingModal.module.sass'
import CodeEditor from '@uiw/react-textarea-code-editor';
import { HubBaseUrl } from "../../../consts";

const modalStyle = {
  position: 'absolute',
  top: '6%',
  left: '50%',
  transform: 'translate(-50%, 0%)',
  width: '89vw',
  height: '82vh',
  bgcolor: '#F0F5FF',
  borderRadius: '5px',
  boxShadow: 24,
  p: 4,
  color: '#000',
  padding: "1px 1px",
  paddingBottom: "15px"
};

interface TabPanelProps {
  index: number;
  selected: number;
  script: Script;
  setUpdated: React.Dispatch<React.SetStateAction<number>>
}

const DEFAULT_TITLE = "New Script"
const DEFAULT_SCRIPT = `function capturedItem(item) {\n  // Your code goes here\n}`

function TabPanel(props: TabPanelProps) {
  const { index, selected, script, setUpdated } = props;

  const [code, setCode] = React.useState(
    DEFAULT_SCRIPT
  );

  const handleClickSaveScript = () => {
    console.log(index);
    console.log(code);
    setUpdated(index);
  };

  const handleClickDeleteScript = () => {
    console.log(index);
    console.log(code);
    setUpdated(index);
  };

  return (
    <>
      {index === selected &&  <div
        role="tabpanel"
        id={`vertical-tabpanel-${index}`}
        aria-labelledby={`vertical-tab-${index}`}
        style={{ width: '100%' }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" style={{ marginBottom: "20px" }}>{script.title}</Typography>
          <Typography><b>Script Index:</b> {index}</Typography>
          <CodeEditor
            value={code}
            language="js"
            placeholder="Please enter JS code."
            onChange={(event) => setCode(event.target.value)}
            padding={8}
            style={{
              fontSize: 14,
              backgroundColor: "#f5f5f5",
              fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
              margin: 10,
            }}
          />
          <Typography style={{ marginBottom: "10px" }}>The JavaScript function <b>capturedItem(item)</b> is pre-defined hook called immediately after an item is captured from the traffic.</Typography>
          <Typography style={{ marginBottom: "10px" }}>Once you save the script, the changes will be applied to all workers.</Typography>
          <Button
            variant="contained"
            onClick={handleClickSaveScript}
            style={{ margin: 10 }}
          >
            Save
          </Button>
          <Button
            variant="contained"
            onClick={handleClickDeleteScript}
            color="error"
            style={{ margin: 10 }}
          >
            Delete
          </Button>
        </Box>
      </div>}
    </>
  );
}

interface Script {
  title: string;
  code: string;
}

type ScriptMap = {
  [key: number]: Script;
};

interface ScriptingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScriptingModal: React.FC<ScriptingModalProps> = ({ isOpen, onClose }) => {

  const [selected, setSelected] = React.useState(0);
  const [updated, setUpdated] = React.useState(0);

  const [scriptMap, setScriptMap] = React.useState({} as ScriptMap);

  const handleChange = (event: React.SyntheticEvent, newKey: number) => {
    setSelected(newKey);
  };

  const handleClickAddScript = () => {
    const obj: Script = {title: DEFAULT_TITLE, code: "" };
    fetch(
      `${HubBaseUrl}/scripts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(obj)
      },
    )
      .then(response => response.json())
      .then(data => {
        setUpdated(data.key);
      })
  };

  useEffect(() => {
    fetch(`${HubBaseUrl}/scripts`)
      .then(response => response.json())
      .then((data: ScriptMap) => {
        setScriptMap(data);
      })
      .catch(err => console.error(err));
  }, [updated]);

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}>
      <Fade in={isOpen}>
        <Box sx={modalStyle}>
          <div className={styles.closeIcon}>
            <img src={closeIcon} alt="close" onClick={() => onClose()} style={{ cursor: "pointer", userSelect: "none" }} />
          </div>
          <div className={styles.headerContainer}>
            <div className={styles.headerSection}>
              <span className={styles.title}>Scripting</span>
            </div>
          </div>

          <div className={styles.modalContainer}>
            <div className={styles.graphSection}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
              </div>
              <div style={{ height: "100%", width: "100%" }}>
                <Box
                  sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex', height: '100%' }}
                >
                  <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={selected}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    sx={{ borderRight: 1, borderColor: 'divider', minWidth: '300px' }}
                  >
                    {
                      Object.keys(scriptMap).map(function(key) {
                        return <Tab
                          key={key}
                          label={scriptMap[key].title}
                        />
                      })
                    }
                    <Button
                      variant="contained"
                      onClick={handleClickAddScript}
                      title="Add a new script"
                      sx={{ margin: "70px", marginTop: "20px" }}
                    >
                      Add script
                    </Button>
                  </Tabs>
                  {
                    Object.keys(scriptMap).map(function(key: string) {
                      return <TabPanel
                        key={key}
                        index={Number(key)}
                        selected={selected}
                        script={scriptMap[key]}
                        setUpdated={setUpdated}
                      />
                    })
                  }
                </Box>
              </div>
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}