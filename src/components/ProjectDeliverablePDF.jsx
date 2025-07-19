import React, { useEffect, useState } from 'react';
import { PDFDownloadLink, Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { db } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 12, fontFamily: 'Helvetica' },
  section: { marginBottom: 16 },
  heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  subheading: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  table: { display: 'table', width: 'auto', marginBottom: 12 },
  tableRow: { flexDirection: 'row' },
  tableColHeader: { width: '16.6%', border: '1px solid #000', backgroundColor: '#eee', padding: 4, fontWeight: 'bold' },
  tableCol: { width: '16.6%', border: '1px solid #000', padding: 4 },
  text: { marginBottom: 2 },
  link: { color: '#0074D9', textDecoration: 'underline' },
  notes: { marginTop: 12, fontSize: 10, color: '#555' },
});

function safeDate(val) {
  if (!val) return '';
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d) ? '' : d.toLocaleDateString();
  }
  if (val.toDate) {
    // Firestore Timestamp
    const d = val.toDate();
    return isNaN(d) ? '' : d.toLocaleDateString();
  }
  return '';
}

function DeliverablePDFDoc({ project, deliverables }) {
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.heading}>Deliverable Format</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.subheading}>Project Name: <Text style={styles.text}>{project?.name || ''}</Text></Text>
          <Text style={styles.text}>Company Name: {String(project?.companyName || '')}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.subheading}>Deliverable Summary</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableColHeader}>Deliverable No</Text>
              <Text style={styles.tableColHeader}>Title</Text>
              <Text style={styles.tableColHeader}>Description</Text>
              <Text style={styles.tableColHeader}>Start Date</Text>
              <Text style={styles.tableColHeader}>End Date</Text>
              <Text style={styles.tableColHeader}>Remarks</Text>
            </View>
            {deliverables.map((d, idx) => (
              <View style={styles.tableRow} key={String(d.id || idx)}>
                <Text style={styles.tableCol}>{String(d.deliverableNo || d.id || idx + 1)}</Text>
                <Text style={styles.tableCol}>{String(d.title || d.name || '')}</Text>
                <Text style={styles.tableCol}>{String(d.description || '')}</Text>
                <Text style={styles.tableCol}>{safeDate(d.startDate)}</Text>
                <Text style={styles.tableCol}>{safeDate(d.endDate)}</Text>
                <Text style={styles.tableCol}>Completed</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.subheading}>Attached Files/Links:</Text>
          {project?.finalLink && (
            <Text style={styles.text}>- Final Deliverable Link: {project.finalLink}</Text>
          )}
        </View>
        
      </Page>
    </Document>
  );
}

export default function ProjectDeliverablePDF({ projectId }) {
  const [project, setProject] = useState(null);
  const [timelines, setTimelines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch project
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      const projectData = projectDoc.exists() ? { id: projectDoc.id, ...projectDoc.data() } : null;
      setProject(projectData);
      // Fetch timeline items (from 'timelines' collection with projectId field)
      const timelinesQuery = query(collection(db, 'timelines'), where('projectId', '==', projectId));
      const timelinesSnap = await getDocs(timelinesQuery);
      setTimelines(timelinesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }
    if (projectId) fetchData();
  }, [projectId]);

  if (loading) return <div>Loading PDF data...</div>;
  if (!project) return <div>Project not found.</div>;

  console.log('PDF project:', project);

  return (
    <div className="my-4">
      <PDFDownloadLink
        document={<DeliverablePDFDoc project={project} deliverables={timelines} />}
        fileName={`Deliverables-${project.name || projectId}.pdf`}
      >
        {({ loading }) => (
          <Button className="bg-[#00B2E2] text-white rounded-2xl px-6 py-2">
            {loading ? 'Generating PDF...' : 'Download Deliverable PDF'}
          </Button>
        )}
      </PDFDownloadLink>
    </div>
  );
} 