/**
 * VanchinAI Integration Test Script
 * 
 * Tests all 7 main agents to ensure they're working correctly
 */

import { VANCHIN_AGENTS, getAllAgents } from "../lib/vanchin-config";
import { createVanchinClient } from "../lib/vanchin-client";

async function testAgent(agentName: keyof typeof VANCHIN_AGENTS) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Testing: ${agentName}`);
  console.log(`${"=".repeat(60)}`);
  
  const client = createVanchinClient(agentName);
  
  console.log(`Name: ${client.agent.name}`);
  console.log(`Description: ${client.agent.description}`);
  console.log(`Endpoint: ${client.agent.endpoint}`);
  console.log(`API Key: ${client.agent.apiKey.substring(0, 10)}...`);
  
  try {
    console.log(`\nSending test message...`);
    
    const response = await client.createCompletion([
      { role: "system", content: "You are a helpful AI assistant. Respond in one short sentence." },
      { role: "user", content: "Say hello and introduce yourself briefly." },
    ]);
    
    console.log(`\n✅ SUCCESS!`);
    console.log(`Response: ${response.choices[0].message.content}`);
    
    if (response.usage) {
      console.log(`\nUsage:`);
      console.log(`  - Prompt tokens: ${response.usage.prompt_tokens}`);
      console.log(`  - Completion tokens: ${response.usage.completion_tokens}`);
      console.log(`  - Total tokens: ${response.usage.total_tokens}`);
    }
    
    return true;
  } catch (error) {
    console.error(`\n❌ FAILED!`);
    console.error(`Error:`, error);
    return false;
  }
}

async function testAllAgents() {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`VanchinAI Integration Test`);
  console.log(`${"=".repeat(60)}`);
  console.log(`Testing ${Object.keys(VANCHIN_AGENTS).length} agents...`);
  
  const results: Record<string, boolean> = {};
  
  for (const agentName of Object.keys(VANCHIN_AGENTS) as Array<keyof typeof VANCHIN_AGENTS>) {
    const success = await testAgent(agentName);
    results[agentName] = success;
    
    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Test Results Summary`);
  console.log(`${"=".repeat(60)}`);
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.values(results).length;
  
  for (const [agent, success] of Object.entries(results)) {
    console.log(`${success ? "✅" : "❌"} ${agent}`);
  }
  
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Total: ${passed}/${total} agents passed`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  console.log(`${"=".repeat(60)}\n`);
  
  return passed === total;
}

// Run tests
testAllAgents()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error("Test execution failed:", error);
    process.exit(1);
  });
