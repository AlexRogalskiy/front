import React, { useState, useEffect } from "react";
import {
  Box,
  Fade,
  Modal,
  Backdrop,
  Grid,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
} from "@mui/material";
import { SelectChangeEvent } from '@mui/material/Select';
import Graph from "react-graph-vis";
import CloseIcon from '@mui/icons-material/Close';
import styles from './ServiceMapModal.module.sass'
import { GraphData, Node, Edge } from "./ServiceMapModalTypes"
import ServiceMapOptions from './ServiceMapOptions'
import { Entry } from "../../EntryListItem/Entry";
import variables from '../../../variables.module.scss';

const modalStyle = {
  position: 'absolute',
  top: '2%',
  left: '50%',
  transform: 'translate(-50%, 0%)',
  width: '96vw',
  height: '96vh',
  bgcolor: '#F0F5FF',
  borderRadius: '5px',
  boxShadow: 24,
  color: '#000',
  padding: "1px 1px"
};

interface ServiceMapModalProps {
  entries: Entry[];
  lastUpdated: number;
  setLastUpdated: React.Dispatch<React.SetStateAction<number>>;
  isOpen: boolean;
  onClose: () => void;
}

enum EdgeTypes {
  Count = "count",
  Size = "size",
}

/**
 * Converts a long string of bytes into a readable format e.g KB, MB, GB, TB, YB
 *
 * @param {Int} num The number of bytes.
 */
function humanReadableBytes(bytes): string {
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const result = (bytes / Math.pow(1024, i)).toFixed(2);
  return result + ' ' + sizes[i];
}

export const ServiceMapModal: React.FC<ServiceMapModalProps> = ({ entries, lastUpdated, setLastUpdated, isOpen, onClose }) => {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [graphOptions, setGraphOptions] = useState(ServiceMapOptions);
  const [lastEntriesLength, setLastEntriesLength] = useState(0);

  const [edgeType, setEdgeType] = useState("");

  useEffect(() => {
    if (entries.length === lastEntriesLength) {
      return;
    }
    setLastEntriesLength(entries.length);

    const nodeMap = {};
    const edgeMap = {};
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    entries.map(entry => {
      let srcName = entry.src.name;
      if (srcName.length === 0) {
        srcName = entry.src.ip;
      }

      let dstName = entry.dst.name;
      if (dstName.length === 0) {
        dstName = entry.dst.ip;
      }

      let srcId: number;
      let dstId: number;

      const nameArr: string[] = [srcName, dstName];
      for (let i = 0; i < nameArr.length; i++) {
        const nodeKey: string = nameArr[i];
        let node: Node;
        if (nodeKey in nodeMap) {
          node = nodeMap[nodeKey]
          nodeMap[nodeKey].value++;
        } else {
          node = {
            id: Object.keys(nodeMap).length,
            value: 1,
            label: nodeKey,
            title: nodeKey,
            color: variables.lightBlueColor,
          };
          nodeMap[nodeKey] = node;
          nodes.push(node);
        }

        if (i == 0)
          srcId = node.id;
        else
          dstId = node.id;
      }

      const edgeKey = `${srcId}_${dstId}`;

      let edge: Edge;
      if (edgeKey in edgeMap) {
        edge = edgeMap[edgeKey];
      } else {
        edge = {
          from: srcId,
          to: dstId,
          value: 0,
          label: "",
          title: entry.proto.longName,
          color: entry.proto.backgroundColor,
        }
        edgeMap[edgeKey] = edge;
        edges.push(edge);
      }

      switch (edgeType) {
      case EdgeTypes.Count:
        edgeMap[edgeKey].value++;
        edgeMap[edgeKey].label = `${edgeMap[edgeKey].value}`;
        break;
      case EdgeTypes.Size:
        edgeMap[edgeKey].value += entry.size;
        edgeMap[edgeKey].label = humanReadableBytes(edgeMap[edgeKey].value);
        break;
      }
    });

    setGraphData({
      nodes: nodes,
      edges: edges,
    })
  }, [entries, lastUpdated]);

  useEffect(() => {
    setEdgeType(EdgeTypes.Count);
    if (graphData?.nodes?.length === 0) return;
    const options = { ...graphOptions };
    setGraphOptions(options);
  }, [graphData?.nodes?.length]);

  const handleEdgeChange = (event: SelectChangeEvent) => {
    setEdgeType(event.target.value as string);
    setLastEntriesLength(0);
    setLastUpdated(Date.now());
  };

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={isOpen}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}>
      <Fade in={isOpen}>
        <Box sx={modalStyle}>
          <div className={styles.headerContainer}>
            <Grid container spacing={2}>
              <Grid item xs={11}>
                <div className={styles.headerSection}>
                  <span className={styles.title}>Service Map</span>
                </div>
              </Grid>
              <Grid item xs={1}>
                <IconButton onClick={() => onClose()} style={{
                  margin: "10px",
                  float: "right",
                  padding: "2px",
                }}>
                  <CloseIcon />
                </IconButton>
              </Grid>
            </Grid>
          </div>

          <div className={styles.modalContainer}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
            </div>
            <div style={{ height: "100%", width: "100%" }}>
              <Card sx={{ maxWidth: "20%" }}>
                <CardContent>
                  <FormControl fullWidth size="small">
                    <InputLabel id="edge-select-label">Edge</InputLabel>
                    <Select
                      labelId="edge-select-label"
                      id="edge-select"
                      value={edgeType}
                      label="Edge"
                      onChange={handleEdgeChange}
                    >
                      <MenuItem value={EdgeTypes.Count}>Number of Items</MenuItem>
                      <MenuItem value={EdgeTypes.Size}>Traffic Load</MenuItem>
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>

              <Graph
                graph={graphData}
                options={graphOptions}
              />
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}
