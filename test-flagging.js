const { analyzeForRiskFactors } = require('./src/services/gemini.service');

async function testFlagging() {
  console.log('Testing improved flagging system...\n');

  const testMessages = [
    "fuck you teacher I understand you're feeling angry",
    "fuck you",
    "I hate everything and want to die",
    "I'm having trouble with my studies",
    "This is inappropriate sexual content",
    "I want to hurt someone",
  ];

  for (const message of testMessages) {
    try {
      console.log(`Testing: "${message}"`);
      const analysis = await analyzeForRiskFactors(message);
      console.log(`Risk Level: ${analysis.riskLevel}`);
      console.log(`Concerns: ${JSON.stringify(analysis.concerns)}`);
      console.log(`Explanation: ${analysis.explanation}`);
      console.log(`Content Type: ${analysis.contentType}`);
      console.log(`Will be flagged: ${analysis.riskLevel >= 3 ? 'YES' : 'NO'}`);
      console.log('---\n');
    } catch (error) {
      console.error(`Error testing "${message}":`, error.message);
      console.log('---\n');
    }
  }
}

testFlagging().catch(console.error); 