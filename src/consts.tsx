const HubHost = window.__RUNTIME_CONFIG__.REACT_APP_HUB_HOST.trim() ? window.__RUNTIME_CONFIG__.REACT_APP_HUB_HOST.trim() : window.location.hostname;
const HubPort = window.__RUNTIME_CONFIG__.REACT_APP_HUB_PORT.trim() ? window.__RUNTIME_CONFIG__.REACT_APP_HUB_PORT.trim() : ":8898";
const HubBaseUrl = `${window.location.protocol !== "https:" ? "http" : "https"}://${HubHost}${HubPort.length > 0 && ["/", ":"].includes(HubPort[0]) ? "" : ":"}${HubPort}`
const HubWsUrl = `${window.location.protocol !== "https:" ? "ws" : "wss"}://${HubHost}${HubPort.length > 0 && ["/", ":"].includes(HubPort[0]) ? "" : ":"}${HubPort}/ws`
const HubScriptLogsWsUrl = `${window.location.protocol !== "https:" ? "ws" : "wss"}://${HubHost}${HubPort.length > 0 && ["/", ":"].includes(HubPort[0]) ? "" : ":"}${HubPort}/scripts/logs`

const ColorGreen = "#d2fad2"
const ColorRed = "#fad6dc"
const ColorYellow = "#f6fad2"
const ColorWhite = "#ffffff"

export {
  HubHost,
  HubPort,
  HubBaseUrl,
  HubWsUrl,
  HubScriptLogsWsUrl,
  ColorGreen,
  ColorRed,
  ColorYellow,
  ColorWhite,
}
