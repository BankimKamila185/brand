const fs = require('fs');
const path = require('path');

function testParse() {
    const testContent = fs.readFileSync(path.join(__dirname, 'docs', 'Refund-Policy.md'), 'utf8');
    console.log("Test content read!");
    
    // Simplified version of parseMarkdownToJsx, focusing only on table parsing!
    let processed = testContent;
    const placeholders = {
        "[BUSINESS_NAME]": "THE OUTLIERS STUDIO PRIVATE LIMITED",
        "[BRAND_NAME]": "The Outliers Studio",
        "[REGISTERED_OFFICE_ADDRESS]": "Flat No. 402, 4th Floor, Block-A, Streetwear Residency, HSR Layout Sector 2, Bengaluru, Karnataka - 560102, India",
        "[WAREHOUSE_ADDRESS]": "Warehouse No. 12, Ground Floor, Industrial Logistics Park, Nelamangala Road, Bengaluru Rural, Karnataka - 562123, India",
        "[GSTIN]": "29AAAAA0000A1Z1",
        "[PAN]": "AAAAA0000A",
        "[CIN]": "U17299KA2026PTC123456",
        "[SUPPORT_PHONE]": "+91 73044 06772",
        "[SUPPORT_EMAIL]": "support@theoutliersstudio.com",
        "[GRIEVANCE_EMAIL]": "grievance@theoutliersstudio.com",
        "[NODAL_EMAIL]": "nodal@theoutliersstudio.com",
        "[WORKING_HOURS]": "Monday to Saturday, 10:00 AM to 7:00 PM (IST)",
        "[WEBSITE_URL]": "https://brand-two-mocha.vercel.app",
        "[INSTAGRAM_URL]": "https://instagram.com/theoutliersstudio"
    };
    Object.keys(placeholders).forEach((key) => {
        processed = processed.replaceAll(key, placeholders[key]);
    });

    const lines = processed.split("\n");
    console.log("Lines:", lines.length);
    
    let tableHeaders = [];
    let tableRows = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        console.log(`Line ${i} (trimmed): ${JSON.stringify(line)}`);
        if (line.startsWith("|")) {
            console.log(`  → Table line!`);
            const cols = line.split("|").map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
            console.log(`  → Cols:`, cols);
            if (line.includes(":---") || line.includes("---:")) {
                console.log(`  → Skip separator line!`);
                continue;
            }
            if (tableHeaders.length === 0) {
                console.log(`  → Set table headers!`);
                tableHeaders = cols;
            } else {
                console.log(`  → Add table row!`);
                tableRows.push(cols);
            }
        }
    }
    console.log("\nTable Headers:", tableHeaders);
    console.log("Table Rows:", tableRows);
}

testParse();
