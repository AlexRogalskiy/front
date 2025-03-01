import React, { useEffect, useState } from "react";
import EntryViewer from "./EntryViewer/EntryViewer";
import { EntryItem } from "../EntryListItem/EntryListItem";
import makeStyles from '@mui/styles/makeStyles';
import Protocol, { ProtocolInterface } from "../UI/Protocol/Protocol"
import Queryable from "../UI/Queryable/Queryable";
import { toast } from "react-toastify";
import { useRecoilState, useRecoilValue } from "recoil";
import focusedItemAtom from "../../recoil/focusedItem";
import focusedContextAtom from "../../recoil/focusedContext";
import queryAtom from "../../recoil/query";
import useWindowDimensions, { useRequestTextByWidth } from "../../hooks/WindowDimensionsHook";
import entryDataAtom from "../../recoil/entryData";
import { LoadingWrapper } from "../UI/withLoading/withLoading";
import { HubBaseUrl } from "../../consts";
import { Entry } from "../EntryListItem/Entry";
import { TcpStream } from "./TcpStream/TcpStream";
import { getSessionToken, getRefreshToken } from '@descope/react-sdk';

const useStyles = makeStyles(() => ({
  entryTitle: {
    display: 'flex',
    minHeight: 20,
    maxHeight: 46,
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 6,
    padding: 2,
    paddingBottom: 0
  },
  entrySummary: {
    display: 'flex',
    minHeight: 36,
    maxHeight: 46,
    alignItems: 'center',
    marginBottom: 4,
    padding: 5,
    paddingBottom: 0
  }
}));

interface DataModel {
  request: unknown;
  response: unknown;
  requestSize: number;
  responseSize: number;
}

interface EntryTitleProps {
  protocol: ProtocolInterface;
  data: DataModel;
  elapsedTime: number;
}

export const formatSize = (n: number): string => n > 1000 ? `${Math.round(n / 1000)}kB` : `${n}B`;
const minSizeDisplayRequestSize = 880;
const EntryTitle: React.FC<EntryTitleProps> = ({ protocol, data, elapsedTime }) => {
  const classes = useStyles();
  const request = data.request;
  const response = data.response;

  const { width } = useWindowDimensions();
  const { requestText, responseText, elapsedTimeText } = useRequestTextByWidth(width)

  return <div className={classes.entryTitle}>
    <Protocol protocol={protocol} horizontal={true} />
    {(width > minSizeDisplayRequestSize) && <div style={{ right: "30px", position: "absolute", display: "flex" }}>
      {request && <Queryable
        query={`requestSize == ${data.requestSize}`}
        style={{ margin: "0 18px" }}
        displayIconOnMouseOver={true}
      >
        <div
          style={{ opacity: 0.5 }}
          id="entryDetailedTitleRequestSize"
        >
          {`${requestText}${formatSize(data.requestSize)}`}
        </div>
      </Queryable>}
      {response && <Queryable
        query={`responseSize == ${data.responseSize}`}
        style={{ margin: "0 18px" }}
        displayIconOnMouseOver={true}
      >
        <div
          style={{ opacity: 0.5 }}
          id="entryDetailedTitleResponseSize"
        >
          {`${responseText}${formatSize(data.responseSize)}`}
        </div>
      </Queryable>}
      {response && <Queryable
        query={`elapsedTime >= ${elapsedTime}`}
        style={{ margin: "0 0 0 18px" }}
        displayIconOnMouseOver={true}
      >
        <div
          style={{ opacity: 0.5 }}
          id="entryDetailedTitleElapsedTime"
        >
          {`${elapsedTimeText}${Math.round(elapsedTime)}ms`}
        </div>
      </Queryable>}
    </div>}
  </div>;
};

interface EntrySummaryProps {
  entry: Entry;
}

const EntrySummary: React.FC<EntrySummaryProps> = ({ entry }) => {
  return <EntryItem
    key={entry.id}
    entry={entry}
    style={{}}
    headingMode={true}
    namespace={entry.dst.namespace}
  />;
};



export const EntryDetailed: React.FC = () => {

  const focusedItem = useRecoilValue(focusedItemAtom);
  const focusedContext = useRecoilValue(focusedContextAtom);
  const query = useRecoilValue(queryAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [entryData, setEntryData] = useRecoilState(entryDataAtom)

  useEffect(() => {
    setEntryData(null);
    if (!focusedItem) return;
    if (!focusedContext) return;
    setIsLoading(true);
    fetch(`${HubBaseUrl}/item/${focusedItem}?q=${encodeURIComponent(query)}&c=${encodeURIComponent(focusedContext)}&refresh-token=${encodeURIComponent(getRefreshToken())}`, {
      headers: {
        Authorization: getSessionToken(),
      },
    })
      .then(response => response.ok ? response : response.text().then(err => Promise.reject(err)))
      .then(response => response.json())
      .then(data => {
        data.base.context = focusedContext;
        setEntryData(data);
      })
      .catch(err => {
        console.error(err);
        toast.error(err.toString(), {
          theme: "colored"
        });
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line
  }, [focusedItem, focusedContext]);

  return <LoadingWrapper isLoading={isLoading} loaderMargin={50} loaderHeight={60}>
    {entryData && <React.Fragment>
      <EntryTitle protocol={entryData.protocol} data={entryData.data} elapsedTime={entryData.data.elapsedTime} />
      <EntrySummary entry={entryData.base} />
      <TcpStream
        index={entryData.data.index}
        stream={entryData.data.stream}
        context={entryData.base.context}
        worker={entryData.data.worker}
        node={entryData.data.node}
        color={entryData.protocol.backgroundColor}
        ip={entryData.data.dst.ip}
        port={entryData.data.dst.port}
        layer4={entryData.protocol.layer4.toUpperCase()}
      />
      <EntryViewer
        representation={entryData.representation}
        source={entryData.data.src}
        destination={entryData.data.dst}
        color={entryData.protocol.backgroundColor}
      />
    </React.Fragment>}
  </LoadingWrapper>
};
