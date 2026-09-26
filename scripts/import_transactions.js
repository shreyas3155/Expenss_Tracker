const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField);
      currentField = '';
      if (currentRow.some((f) => f.trim().length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((f) => f.trim().length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

async function main() {
  console.log('🚀 Starting fast batch transaction import into Supabase PostgreSQL...');

  // 1. Ensure primary user exists
  const user = await prisma.user.upsert({
    where: { email: 'shreyas@hathiwala.com' },
    update: {},
    create: {
      name: 'Shreyas Hathiwala',
      email: 'shreyas@hathiwala.com',
      password: 'Shreyas@3155',
      role: 'OWNER',
    },
  });
  console.log(`👤 Verified Owner Account: ${user.name} (${user.email}) [ID: ${user.id}]`);

  // 2. Read CSV file
  let csvPath = path.join(__dirname, '..', 'data', 'imported_transactions.csv');
  const uploadedPath =
    'C:/Users/DIVYESH/.gemini/antigravity-ide/brain/7819356b-f5bc-49fb-9e8a-b5dddde0bd3f/.user_uploaded/media_1790407179058.csv';

  if (fs.existsSync(uploadedPath)) {
    csvPath = uploadedPath;
  }

  console.log(`📄 Reading CSV source from: ${csvPath}`);
  const rawContent = fs.readFileSync(csvPath, 'utf-8');
  const allRows = parseCSV(rawContent);

  // Find header
  const headerIndex = allRows.findIndex(
    (row) =>
      row[0]?.trim().toLowerCase() === 'date' &&
      row[1]?.trim().toLowerCase() === 'payee'
  );

  if (headerIndex === -1) {
    throw new Error('Could not find CSV header row with "Date,Payee"!');
  }

  const dataRows = allRows.slice(headerIndex + 1);
  console.log(`📊 Found ${dataRows.length} raw CSV transaction entries.`);

  const seenMessageIds = new Set();
  const txBatch = [];

  let totalDebitAmount = 0;
  let totalCreditAmount = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rawDate = row[0]?.trim() || '';
    const rawPayee = row[1]?.trim() || 'Unknown Payee';
    const rawAmount = row[2]?.trim() || '0';
    const rawCategory = row[3]?.trim() || 'Other';
    const rawRefNo = row[4]?.trim() || 'N/A';
    const rawNotes = row[5]?.trim() || '';
    const rawBankDetails = row[6]?.trim() || '';
    const rawMsgId = row[7]?.trim() || '';
    const rawType = row[8]?.trim().toLowerCase() || 'debit';
    const rawSource = row[9]?.trim() || 'HDFC Bank';

    if (!rawDate && !rawAmount && !rawMsgId) continue;

    const amount = Math.abs(parseFloat(rawAmount.replace(/[^0-9.-]/g, ''))) || 0;
    const type = rawType.includes('credit') ? 'Credit' : 'Debit';
    const isAi = rawSource.toLowerCase().includes('ai');
    const sourceFormatted = rawSource.toLowerCase().includes('ai')
      ? 'HDFC Bank (AI Parse)'
      : rawSource.toLowerCase().includes('regex')
      ? 'HDFC Bank (Regex)'
      : `HDFC Bank (${rawSource})`;

    let messageId = rawMsgId;
    if (!messageId || seenMessageIds.has(messageId)) {
      messageId = `${rawMsgId || 'tx'}_${rawDate}_${amount}_${rawRefNo}_${i}`;
    }
    seenMessageIds.add(messageId);

    if (type === 'Credit') {
      totalCreditAmount += amount;
    } else {
      totalDebitAmount += amount;
    }

    txBatch.push({
      userId: user.id,
      date: rawDate,
      payee: rawPayee,
      amount: amount,
      category: rawCategory,
      referenceNo: rawRefNo,
      notes: rawNotes,
      bankNotification: rawBankDetails,
      messageId: messageId,
      type: type,
      source: sourceFormatted,
      aiParsed: isAi,
      aiModel: isAi ? 'Gemini 1.5 Flash' : 'HDFC Rule Engine',
    });
  }

  console.log(`⚡ Inserting batch of ${txBatch.length} transactions via bulk createMany...`);

  const result = await prisma.transaction.createMany({
    data: txBatch,
    skipDuplicates: true,
  });

  const finalCount = await prisma.transaction.count();

  console.log('\n=============================================');
  console.log('🎉 BULK IMPORT COMPLETE');
  console.log('=============================================');
  console.log(`✅ Newly Added in this run: ${result.count}`);
  console.log(`📈 Total Transactions in Supabase DB: ${finalCount}`);
  console.log(`💳 Total Expenses (Debits):  ₹${totalDebitAmount.toLocaleString('en-IN')}`);
  console.log(`💰 Total Income (Credits):    ₹${totalCreditAmount.toLocaleString('en-IN')}`);
  console.log(`💵 Net Balance:               ₹${(totalCreditAmount - totalDebitAmount).toLocaleString('en-IN')}`);
  console.log('=============================================\n');
}

main()
  .catch((e) => {
    console.error('Fatal error during import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
