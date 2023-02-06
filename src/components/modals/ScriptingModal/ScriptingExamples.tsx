const SCRIPT_EMPTY = `function capturedItem(data) {
  // Your code goes here
}

function capturedPacket(info) {
  // Your code goes here
}

function queriedItem(data) {
  // Your code goes here
}
`;

const SCRIPT_WEBHOOK = `// Call a Webhook For Each Health Check

function capturedItem(data) {
  console.log(data.Request.path);
  if (data.Request.path === "/health")
    webhook("POST", WEBHOOK_URL, data);
}
`;

const SCRIPT_SLACK = `// Report To a Slack Channel If Response Status Code is 500

function capturedItem(data) {
  if (data.Response.status === 500)
    slack(SLACK_AUTH_TOKEN, SLACK_CHANNEL_ID, "Server-side Error", JSON.stringify(data), "#ff0000");
}
`;

const SCRIPT_PACKET_AND_BYTE_COUNTER = `// Packet and Byte Counter

var packetCount = 0;
var totalBytes = 0;

function capturedItem(data) {
  console.log("Captured packet count:", packetCount)
  console.log("Total bytes processed:", totalBytes)
}

function capturedPacket(info) {
  packetCount++
  totalBytes += info.Length
}
`;

const SCRIPT_MONITORING_PASS_HTTP = `// Monitoring: Pass HTTP Traffic, Fail Anything Else

function queriedItem(data) {
  if (data.Protocol.Name == "http")
    return pass(data)
  else
    return fail(data)
}
`;

const SCRIPT_PRINT_CONSTS = `// Print Constants

console.log(CONSTS);
`

const EXAMPLE_SCRIPTS = [
  SCRIPT_EMPTY,
  SCRIPT_SLACK,
  SCRIPT_WEBHOOK,
  SCRIPT_PACKET_AND_BYTE_COUNTER,
  SCRIPT_MONITORING_PASS_HTTP,
  SCRIPT_PRINT_CONSTS
]

const EXAMPLE_SCRIPT_TITLES = [
  "Empty",
  "Report To a Slack Channel If Response Status Code is 500",
  "Call a Webhook For Each Health Check",
  "Packet and Byte Counter",
  "Monitoring: Pass HTTP Traffic, Fail Anything Else",
  "Print Constants",
]

const DEFAULT_TITLE = "New Script"
const DEFAULT_SCRIPT = SCRIPT_EMPTY

export {
  SCRIPT_EMPTY,
  SCRIPT_WEBHOOK,
  SCRIPT_PACKET_AND_BYTE_COUNTER,
  SCRIPT_MONITORING_PASS_HTTP,
  EXAMPLE_SCRIPTS,
  EXAMPLE_SCRIPT_TITLES,
  DEFAULT_TITLE,
  DEFAULT_SCRIPT,
}