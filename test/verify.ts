import 'reflect-metadata';
import fs from 'fs';
import path from 'path';
import { parseKeystoreFile } from '../src/core/parser';

async function runTests() {
  console.log('--- Starting Keystore Parsing Verification Tests ---');

  // Test 1: Pure Sun JKS Parsing (0xfeedfeed binary format)
  console.log('\n[Test 1] Testing Pure Sun JKS parser with pure-sun-jks.jks...');
  const sunJksPath = path.resolve(process.cwd(), 'public/samples/pure-sun-jks.jks');
  const sunJksBuffer = fs.readFileSync(sunJksPath);
  
  const sunJksResult = await parseKeystoreFile(new Uint8Array(sunJksBuffer), {
    fileName: 'pure-sun-jks.jks',
    password: 'changeit',
  });

  console.log(`✓ Sun JKS Keystore parsed: type=${sunJksResult.type}, version=${sunJksResult.version}, entries=${sunJksResult.entryCount}, integrityVerified=${sunJksResult.integrityVerified}`);
  if (sunJksResult.type !== 'JKS') {
    throw new Error(`Expected type 'JKS', got ${sunJksResult.type}`);
  }
  if (sunJksResult.integrityVerified !== true) {
    throw new Error(`Expected integrityVerified to be true, got ${sunJksResult.integrityVerified}`);
  }

  // Test 2: Standard Sample Keystore
  console.log('\n[Test 2] Testing sample-keystore.jks...');
  const jksPath = path.resolve(process.cwd(), 'public/samples/sample-keystore.jks');
  const jksBuffer = fs.readFileSync(jksPath);
  
  const jksResult = await parseKeystoreFile(new Uint8Array(jksBuffer), {
    fileName: 'sample-keystore.jks',
    password: 'changeit',
  });

  console.log(`✓ Keystore parsed: type=${jksResult.type}, entries=${jksResult.entryCount}`);
  if (jksResult.entryCount !== 3) {
    throw new Error(`Expected 3 entries in sample-keystore.jks, got ${jksResult.entryCount}`);
  }

  const serverRsaEntry = jksResult.entries.find((e) => e.alias === 'server-rsa');
  if (!serverRsaEntry) throw new Error('Missing server-rsa entry');
  const cert = serverRsaEntry.chain[0];
  console.log(`✓ server-rsa cert CN: ${cert.commonName}, algo: ${cert.publicKey.algorithm}, bitLength: ${cert.publicKey.bitLength}`);
  console.log(`✓ server-rsa SANs: ${JSON.stringify(cert.sans)}`);
  console.log(`✓ server-rsa SHA-256: ${cert.fingerprints.sha256}`);
  
  if (cert.sans.length < 3) {
    throw new Error(`Expected at least 3 SANs, found ${cert.sans.length}`);
  }

  // Test 3: PKCS12 Parsing
  console.log('\n[Test 3] Testing PKCS#12 parser with sample-pkcs12.p12...');
  const p12Path = path.resolve(process.cwd(), 'public/samples/sample-pkcs12.p12');
  const p12Buffer = fs.readFileSync(p12Path);
  const p12Result = await parseKeystoreFile(new Uint8Array(p12Buffer), {
    fileName: 'sample-pkcs12.p12',
    password: 'changeit',
  });

  console.log(`✓ PKCS#12 Keystore parsed: type=${p12Result.type}, entries=${p12Result.entryCount}`);
  if (p12Result.entryCount < 3) {
    throw new Error(`Expected at least 3 entries in sample-pkcs12.p12, got ${p12Result.entryCount}`);
  }

  // Test 4: Expired certificate detection
  console.log('\n[Test 4] Testing expired certificate detection with expired-sample.jks...');
  const expPath = path.resolve(process.cwd(), 'public/samples/expired-sample.jks');
  const expBuffer = fs.readFileSync(expPath);
  const expResult = await parseKeystoreFile(new Uint8Array(expBuffer), {
    fileName: 'expired-sample.jks',
    password: 'changeit',
  });

  const expCert = expResult.entries[0].chain[0];
  console.log(`✓ Expired cert status: ${expCert.validityStatus}, daysRemaining: ${expCert.daysRemaining}`);
  if (expCert.validityStatus !== 'expired') {
    throw new Error(`Expected validityStatus 'expired', got ${expCert.validityStatus}`);
  }

  console.log('\n✅ ALL 4 VERIFICATION TESTS PASSED WITH 100% SUCCESS!\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
