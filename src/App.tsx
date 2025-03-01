import './App.sass';
import React, { useState } from "react";
import { Header } from "./components/Header/Header";
import { TrafficPage } from "./components/Pages/TrafficPage/TrafficPage";
import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material';
import { useRecoilState } from "recoil";
import serviceMapModalOpenAtom from "./recoil/serviceMapModalOpen";
import scriptingModalOpenAtom from "./recoil/scriptingModalOpen";
import jobsModalOpenAtom from "./recoil/jobsModalOpen";
import { ServiceMapModal } from './components/modals/ServiceMapModal/ServiceMapModal';
import { ScriptingModal } from './components/modals/ScriptingModal/ScriptingModal';
import { JobsModal } from './components/modals/JobsModal/JobsModal';
import { Entry } from "./components/EntryListItem/Entry";
import { HubBaseUrl } from "./consts";
import { toast } from "react-toastify";
import { AuthProvider } from '@descope/react-sdk';

const App: React.FC = () => {

  const [entries, setEntries] = useState([] as Entry[]);
  const [lastUpdated, setLastUpdated] = useState(0);
  const [serviceMapModalOpen, setServiceMapModalOpen] = useRecoilState(serviceMapModalOpenAtom);
  const [scriptingModalOpen, setScriptingModalOpen] = useRecoilState(scriptingModalOpenAtom);
  const [jobsModalOpen, setJobsModalOpen] = useRecoilState(jobsModalOpenAtom);

  const [licenseEdition, setLicenseEdition] = useState("community");
  const [licenseExpired, setLicenseExpired] = useState(false);
  const [licenseEnd, setLicenseEnd] = useState(new Date().getTime());
  const [licenseCurrentNodeCount, setLicenseCurrentNodeCount] = useState(0);
  const [licenseNodeLimit, setLicenseNodeLimit] = useState(0);

  const [edgeType, setEdgeType] = useState("bandwidth");
  const [nodeType, setNodeType] = useState("name");

  const getLicense = () => {
    fetch(`${HubBaseUrl}/license`)
      .then(response => response.ok ? response : response.text().then(err => Promise.reject(err)))
      .then(response => response.json())
      .then(data => {
        setLicenseEdition(data.doc.edition);
        setLicenseExpired(data.expired);
        setLicenseEnd(data.doc.end);
        setLicenseCurrentNodeCount(data.currentNodeCount);
        setLicenseNodeLimit(data.doc.nodes);
      })
      .catch(err => {
        console.error(err);
        toast.error(err.toString(), {
          theme: "colored"
        });
      });
  };

  return (
    <StyledEngineProvider injectFirst>
      {/* The code below includes your Project ID (P2PyftOipp2EcXXRyivNwlJkUMHm) */}
      <AuthProvider projectId="P2PyftOipp2EcXXRyivNwlJkUMHm">
        <ThemeProvider theme={createTheme(({}))}>
          <div className="kubesharkApp">
            <Header
              licenseEdition={licenseEdition}
              licenseExpired={licenseExpired}
              licenseEnd={licenseEnd}
              licenseCurrentNodeCount={licenseCurrentNodeCount}
              licenseNodeLimit={licenseNodeLimit}
            />
            <TrafficPage
              entries={entries}
              setEntries={setEntries}
              setLastUpdated={setLastUpdated}
              getLicense={getLicense}
            />
            {serviceMapModalOpen && <ServiceMapModal
              entries={entries}
              lastUpdated={lastUpdated}
              setLastUpdated={setLastUpdated}
              isOpen={serviceMapModalOpen}
              onClose={() => setServiceMapModalOpen(false)}
              edgeType={edgeType}
              setEdgeType={setEdgeType}
              nodeType={nodeType}
              setNodeType={setNodeType}
            />}
            {scriptingModalOpen && <ScriptingModal
              isOpen={scriptingModalOpen}
              onClose={() => setScriptingModalOpen(false)}
            />}
            {jobsModalOpen && <JobsModal
              isOpen={jobsModalOpen}
              onClose={() => setJobsModalOpen(false)}
            />}
          </div>
        </ThemeProvider>
      </AuthProvider>
    </StyledEngineProvider>
  );
}

export default App;
