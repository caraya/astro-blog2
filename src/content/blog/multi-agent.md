# Architecting Multi-Agent Systems: MCP, Dynamic Skills, and Intent Routing

As artificial intelligence shifts from monolithic chat interfaces to distributed multi-agent systems, managing context size, tool permissions, and system security requires a structured architecture. Giving a single agent access to dozens of tools and instructions bloats the context window, increases token costs, and degrades reasoning capability. 

To build secure, scalable systems, engineering teams use the Model Context Protocol (MCP) to decouple capabilities from the agent's baseline prompt, allowing for dynamic skill retrieval, intelligent routing, and strict execution guardrails.

## The Taxonomy of Agentic Systems

Designing an efficient architecture requires establishing clear boundaries between system components.

*   **Agent (Orchestrator):** The primary autonomous router. It processes user intent, manages state, and determines which sub-agents, skills, or tools to invoke.
*   **Sub-agent:** A specialized worker assigned to a specific domain (e.g., a "polyglot-developer"). Sub-agents operate with isolated system prompts and restricted tool access. 
*   **Static Skills:** Designing an agent with predefined operational scope baked directly into its system prompt. This is efficient for highly specific sub-agents but scales poorly for broad orchestrators.
*   **Dynamic Skills:** Reusable, procedural knowledge loaded on demand. The orchestrator maintains a minimal prompt and dynamically retrieves task-specific instructions and tool schemas from a registry or MCP server only when required.
*   **Tool:** A functional component that executes operations against external APIs, databases, or local environments.

Instead of one agent juggling every capability, you shift the complexity from prompt management to orchestration. The orchestrator determines the intent and either loads a dynamic skill into its own context or routes the task to an isolated sub-agent.

## Token Optimization and Security Guardrails

By exposing tools and skills via MCP servers, you achieve strict isolation and optimized context windows. The agent queries the server for capabilities and loads only the required schemas, keeping input tokens lean. 

Allowing models to write code, access databases, and trigger workflows asynchronously introduces severe risks. Implement the following guardrails:

1.  **Process Isolation:** Run MCP servers in isolated containers. If an agent executes malicious code, it happens within a sandboxed environment, protecting the host system.
2.  **Transport Security:** Enforce OAuth 2.0/2.1-based authentication. Agents must cryptographically verify their identity before the MCP server grants access.
3.  **Human-in-the-Loop (HITL):** Pause the execution pipeline and require explicit human approval before the MCP server executes state-changing operations (database writes), financial transactions, or unsandboxed local commands.
4.  **Graceful Tool Handling:** If an agent attempts to invoke a tool that is unavailable or restricted, intercept the failure and return a natural language error to the LLM so it can recover, rather than crashing the runtime.

## Implementing the Orchestrator in TypeScript

This implementation demonstrates an orchestrator that connects to an MCP server, uses an LLM to determine user intent, dynamically loads the appropriate skill, and handles missing tools gracefully.

### 1. Connecting to the MCP Server

Use the official MCP TypeScript SDK to connect the orchestrator to external tool and skill servers via standard input/output (stdio).

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export async function createMCPClient(serverPath: string): Promise<Client> {
  const transport = new StdioClientTransport({
    command: serverPath,
    args: []
  });

  const client = new Client(
    { name: 'orchestrator-client', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(transport);
  return client;
}
```

### 2. Building the LLM-Based Intent Router

Instead of brittle keyword matching, use a lightweight LLM call to evaluate the user's intent against the available dynamic skills. The LLM acts as a semantic router.

```typescript
import type { DynamicSkill } from './types';

export async function routeIntent(
  userInput: string, 
  availableSkills: DynamicSkill[],
  llmClient: any // Your preferred LLM SDK client
): Promise<DynamicSkill | undefined> {
  
  const skillDescriptions = availableSkills.map(
    s => `- ID: ${s.id} | Description: ${s.description}`
  ).join('\n');

  const systemPrompt = `You are a semantic router. Match the user request to the most relevant skill ID from the list below. If none match, output "none".
Available Skills:
${skillDescriptions}

Output ONLY the exact skill ID or "none".`;

  const response = await llmClient.complete({
    system: systemPrompt,
    messages: [{ role: 'user', content: userInput }],
    temperature: 0.0
  });

  const selectedId = response.text.trim();
  return availableSkills.find(skill => skill.id === selectedId);
}
```

### 3. Handling Missing Tools Gracefully

When the LLM decides to invoke a tool, verify its existence on the MCP server before execution. If the tool is missing or unauthorized, return a system note to the LLM. This allows the model to apologize to the user or attempt a different strategy.

```typescript
export async function executeToolSafely(
  client: Client, 
  toolName: string, 
  args: Record<string, unknown>
): Promise<string> {
  try {
    const { tools } = await client.listTools();
    const toolExists = tools.some(t => t.name === toolName);

    if (!toolExists) {
      console.warn(`[Execution Guard] Tool ${toolName} requested but unavailable.`);
      // Return a system message so the LLM knows the tool failed, preventing a crash.
      return `System Note: The tool '${toolName}' is currently unavailable or missing. Please use an alternative approach or inform the user.`;
    }

    const result = await client.callTool({
      name: toolName,
      arguments: args
    });
    
    return JSON.stringify(result);
  } catch (error) {
    return `System Note: Tool execution failed due to an error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}
```

### 4. The Complete Orchestration Flow

The orchestrator ties these components together. It routes the intent, dynamically constructs the prompt payload, and maintains a lean token footprint.

```typescript
export async function executeAgentSession(userInput: string, mcpClient: Client, llmClient: any) {
  // 1. Fetch available skills (e.g., from a database or MCP resource list)
  const availableSkills = await fetchAvailableSkills(); 
  
  // 2. Semantically route the intent
  const activeSkill = await routeIntent(userInput, availableSkills, llmClient);

  // 3. Construct the baseline payload
  const payload = {
    system: 'You are a helpful orchestrator. Answer general questions directly.',
    messages: [{ role: 'user', content: userInput }],
    tools: [] as unknown[]
  };

  // 4. Dynamically inject skill context and MCP schemas
  if (activeSkill) {
    console.log(`[Orchestrator] Loading dynamic skill: ${activeSkill.name}`);
    payload.system = activeSkill.systemPrompt;
    
    // Fetch tool schemas from the MCP server matching the skill's required tools
    const mcpTools = await mcpClient.listTools();
    payload.tools = mcpTools.tools.filter(t => 
      activeSkill.requiredToolNames.includes(t.name)
    );
  } else {
    console.log('[Orchestrator] No specialized skill required. Using baseline context.');
  }

  // 5. Execute inference and handle tool calls
  const response = await llmClient.chat(payload);
  
  if (response.toolCalls) {
    for (const call of response.toolCalls) {
      const result = await executeToolSafely(mcpClient, call.name, call.arguments);
      // Append result to conversation history and continue loop...
    }
  }
  
  return response;
}
```

## The MCP Backend: Go Server Implementation

To support the TypeScript orchestrator, you must expose the underlying tools via an MCP server. Go is excellent for this due to its performance and static binaries. Using the `mark3labs/mcp-go` SDK, you can quickly expose a tool over `stdio`.

```go
package main

import (
  "context"
  "log"

  "github.com/mark3labs/mcp-go/mcp"
  "github.com/mark3labs/mcp-go/server"
)

func main() {
  s := server.NewMCPServer(
    "PolyglotDeveloperServer",
    "1.0.0",
    server.WithToolCapabilities(true),
  )

  tool := mcp.NewTool("execute_typecheck",
    mcp.WithDescription("Runs the TypeScript compiler to verify types."),
    mcp.WithString("code",
      mcp.Required(),
      mcp.Description("The source code to typecheck"),
    ),
  )

  s.AddTool(tool, func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
    // Process code securely here (e.g., spawn isolated process)
    return mcp.NewToolResultText("Typecheck passed securely."), nil
  })

  if err := server.ServeStdio(s); err != nil {
    log.Fatalf("Server error: %v", err)
  }
}
```

Because Go compiles to a static binary, you can easily cross-compile the backend for your host architecture (e.g., Apple Silicon macOS) while deploying it across various environments:

```bash
GOOS=darwin GOARCH=arm64 go build -o mcp-server-darwin-arm64 main.go
```