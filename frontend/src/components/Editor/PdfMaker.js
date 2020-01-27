import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import {InlineMath} from "react-katex";

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#E4E4E4'
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1
    }
});

// Create Document Component
const MyDocument = () => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.section}>
                <Text>Section #1</Text>
            </View>
            <View style={styles.section}>
                <Text>Section #2</Text>
                {/*<Text><InlineMath>{'\\frac{1}{\\sqrt{2}}\\cdot 2'}</InlineMath></Text>*/}
            </View>
        </Page>
    </Document>
);

export default (props) => (
    <PDFViewer style={{width: "100%", height: "100%"}}>
        <MyDocument />
    </PDFViewer>
);

