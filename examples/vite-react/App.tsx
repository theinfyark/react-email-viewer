import { EmailViewer } from "react-email-viewer";
import "react-email-viewer/styles.css";

export default function App() {
  return <EmailViewer url="/sample.eml" theme="auto" />;
}
