import React from "react";
import {
  PDFDownloadLink,
  Page,
  Text,
  View,
  Document,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 12, fontFamily: "Helvetica" },
  section: { marginBottom: 16 },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 16,
  },
  tableRow: { flexDirection: "row" },
  tableColLabel: {
    width: "40%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#e3f0fa",
    padding: 6,
    fontWeight: "bold",
  },
  tableColValue: {
    width: "60%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 6,
  },
});

function ReceiptPDFDoc({ project }) {
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.heading}>Payment Receipt</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Project Name</Text>
            <Text style={styles.tableColValue}>{project.name}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Project ID</Text>
            <Text style={styles.tableColValue}>{project.id}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Amount Paid</Text>
            <Text style={styles.tableColValue}>₹{project.amount || 100}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Payment ID</Text>
            <Text style={styles.tableColValue}>{project.paymentId || "N/A"}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Status</Text>
            <Text style={styles.tableColValue}>{project.paymentStatus}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableColLabel}>Date</Text>
            <Text style={styles.tableColValue}>{new Date().toLocaleString()}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

const ReceiptPdf = ({ project }) => (
  <PDFDownloadLink
    document={<ReceiptPDFDoc project={project} />}
    fileName={`Receipt_${project.name || project.id}.pdf`}
    style={{ textDecoration: "none", color: "inherit", width: "100%" }}
  >
    {({ loading }) =>
      loading ? "Preparing PDF..." : "Download Receipt"
    }
  </PDFDownloadLink>
);

export default ReceiptPdf;