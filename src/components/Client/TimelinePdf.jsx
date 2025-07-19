import React, { useEffect, useState } from "react";
import {
  PDFDownloadLink,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 12, fontFamily: "Helvetica" },
  section: { marginBottom: 16 },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subheading: { fontSize: 14, fontWeight: "bold", marginBottom: 4 },
  table: { display: "table", width: "auto", marginBottom: 12 },
  tableRow: { flexDirection: "row" },
  tableColHeader: {
    width: "16.6%",
    border: "1px solid #000",
    backgroundColor: "#eee",
    padding: 4,
    fontWeight: "bold",
  },
  tableCol: { width: "16.6%", border: "1px solid #000", padding: 4 },
  text: { marginBottom: 2 },
  link: { color: "#0074D9", textDecoration: "underline" },
  notes: { marginTop: 12, fontSize: 10, color: "#555" },
});

function safeDate(val) {
  if (!val) return "";
  if (typeof val === "string" || typeof val === "number") {
    const d = new Date(val);
    return isNaN(d) ? "" : d.toLocaleDateString();
  }
  if (val.toDate) {
    // Firestore Timestamp
    const d = val.toDate();
    return isNaN(d) ? "" : d.toLocaleDateString();
  }
  return "";
}

function TimelinePDFDoc({ project, timelineItems }) {
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.subheading}>
            Project Name: <Text style={styles.text}>{project?.name || ""}</Text>
          </Text>
          <Text style={styles.text}>
            Company Name: {String(project?.companyName || "")}
          </Text>
          <Text style={styles.text}>
            Client Name: {String(project?.clientName || "")}
          </Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.subheading}>Timeline Items</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text
                style={[
                  styles.tableColHeader,
                  {
                    backgroundColor: "#e3f0fa",
                    color: "#1e396b",
                    fontWeight: "bold",
                    fontSize: 13,
                  },
                ]}
              >
                No
              </Text>
              <Text
                style={[
                  styles.tableColHeader,
                  {
                    backgroundColor: "#e3f0fa",
                    color: "#1e396b",
                    fontWeight: "bold",
                    fontSize: 13,
                  },
                ]}
              >
                Title
              </Text>
              <Text
                style={[
                  styles.tableColHeader,
                  {
                    backgroundColor: "#e3f0fa",
                    color: "#1e396b",
                    fontWeight: "bold",
                    fontSize: 13,
                  },
                ]}
              >
                Description
              </Text>
              <Text
                style={[
                  styles.tableColHeader,
                  {
                    backgroundColor: "#e3f0fa",
                    color: "#1e396b",
                    fontWeight: "bold",
                    fontSize: 13,
                  },
                ]}
              >
                Start Date
              </Text>
              <Text
                style={[
                  styles.tableColHeader,
                  {
                    backgroundColor: "#e3f0fa",
                    color: "#1e396b",
                    fontWeight: "bold",
                    fontSize: 13,
                  },
                ]}
              >
                End Date
              </Text>
              <Text
                style={[
                  styles.tableColHeader,
                  {
                    backgroundColor: "#e3f0fa",
                    color: "#1e396b",
                    fontWeight: "bold",
                    fontSize: 13,
                  },
                ]}
              >
                Status
              </Text>
            </View>
            {timelineItems.map((d, idx) => (
              <View
                style={[
                  styles.tableRow,
                  { backgroundColor: idx % 2 === 0 ? "#f7fbff" : "#ffffff" },
                ]}
                key={String(d.id || idx)}
              >
                <Text style={styles.tableCol}>{idx + 1}</Text>
                <Text style={styles.tableCol}>
                  {String(d.title || d.name || "")}
                </Text>
                <Text style={styles.tableCol}>
                  {String(d.description || "")}
                </Text>
                <Text style={styles.tableCol}>{safeDate(d.startDate)}</Text>
                <Text style={styles.tableCol}>{safeDate(d.endDate)}</Text>
                <Text
                  style={[
                    styles.tableCol,
                    {
                      color:
                        d.status === "completed"
                          ? "#1e7e34"
                          : d.status === "pending"
                          ? "#b8860b"
                          : "#1e396b",
                      fontWeight: d.status === "completed" ? "bold" : "normal",
                    },
                  ]}
                >
                  {d.status || "-"}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.subheading}>Attached Links:</Text>
          {project?.projectSummary && (
            <Text style={styles.text}>
              - Final Deliverable : {project.projectSummary}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
}

export default function FinalDeliverablePdf({ projectId }) {
  const [project, setProject] = useState(null);
  const [timelineItems, setTimelineItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch project
      const projectDoc = await getDoc(doc(db, "projects", projectId));
      const projectData = projectDoc.exists()
        ? { id: projectDoc.id, ...projectDoc.data() }
        : null;
      setProject(projectData);
      // Fetch timeline items (from 'timelines' collection with projectId field)
      const timelinesQuery = query(
        collection(db, "timelines"),
        where("projectId", "==", projectId)
      );
      const timelinesSnap = await getDocs(timelinesQuery);
      setTimelineItems(
        timelinesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setLoading(false);
    }
    if (projectId) fetchData();
  }, [projectId]);

  if (loading) return <div>Loading PDF data...</div>;
  if (!project) return <div>Project not found.</div>;

  return (
    <div className="my-4">
      <PDFDownloadLink
        document={
          <TimelinePDFDoc project={project} timelineItems={timelineItems} />
        }
        fileName={`Timeline-${project.name || projectId}.pdf`}
      >
        {({ loading }) => (
          <Button className="bg-[#00B2E2] text-white rounded-2xl px-6 py-2">
            {loading ? "Generating PDF..." : "Download Final Deliverable PDF"}
          </Button>
        )}
      </PDFDownloadLink>
    </div>
  );
}
